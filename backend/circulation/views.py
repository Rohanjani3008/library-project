from datetime import date, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminOrLibrarian
from books.models import Book
from .models import Issue, Reservation
from .serializers import IssueSerializer, ReservationSerializer

User = get_user_model()

def find_user(identifier):
    if not identifier:
        return None
    ident = str(identifier).strip()
    return (
        User.objects.filter(enrollment_no__iexact=ident).first() or
        User.objects.filter(username__iexact=ident).first() or
        (User.objects.filter(pk=ident).first() if ident.isdigit() else None)
    )

def find_book(identifier):
    if not identifier:
        return None
    ident = str(identifier).strip()
    return (
        Book.objects.filter(book_code__iexact=ident).first() or
        Book.objects.filter(isbn__iexact=ident).first() or
        (Book.objects.filter(pk=ident).first() if ident.isdigit() else None)
    )

@api_view(['POST'])
@permission_classes([IsAdminOrLibrarian])
def issue_book(request):
    user_ident = request.data.get('enrollment_no') or request.data.get('user_id') or request.data.get('username')
    book_ident = request.data.get('isbn') or request.data.get('book_code') or request.data.get('book_id')

    if not user_ident:
        return Response({'error': 'Please provide student enrollment number or username.'}, status=status.HTTP_400_BAD_REQUEST)
    if not book_ident:
        return Response({'error': 'Please provide book ISBN or book code.'}, status=status.HTTP_400_BAD_REQUEST)

    user = find_user(user_ident)
    if not user:
        return Response({'error': f"Student not found with identifier: {user_ident}"}, status=status.HTTP_404_NOT_FOUND)

    book = find_book(book_ident)
    if not book:
        return Response({'error': f"Book not found with identifier: {book_ident}"}, status=status.HTTP_404_NOT_FOUND)

    # Rule: Available copies check
    if book.available_copies <= 0:
        return Response({
            'error': f"No copies available for '{book.title}'. Current available copies: 0. Student can join reservation queue."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Rule: Maximum books per student
    max_books = getattr(settings, 'MAX_BOOKS_PER_STUDENT', 3)
    active_issues_count = Issue.objects.filter(user=user, status__in=['issued', 'overdue']).count()
    if active_issues_count >= max_books:
        return Response({
            'error': f"Student has already borrowed {active_issues_count} books (Maximum limit is {max_books})."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Rule: Cannot issue same book twice
    if Issue.objects.filter(user=user, book=book, status__in=['issued', 'overdue']).exists():
        return Response({
            'error': f"'{book.title}' is already currently issued to {user.username}."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Loan period
    loan_days = getattr(settings, 'LOAN_PERIOD_DAYS', 14)
    due_date = date.today() + timedelta(days=loan_days)

    issue = Issue.objects.create(
        user=user,
        book=book,
        due_date=due_date,
        status='issued'
    )

    # Reduce available copies
    book.available_copies = max(0, book.available_copies - 1)
    book.save(update_fields=['available_copies'])

    # Fulfill reservation if this user had reserved this book
    Reservation.objects.filter(user=user, book=book, status__in=['waiting', 'ready']).update(status='fulfilled')

    return Response({
        'message': f"Book '{book.title}' issued successfully to {user.first_name or user.username}.",
        'issue': IssueSerializer(issue).data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAdminOrLibrarian])
def return_book(request):
    issue_id = request.data.get('issue_id')
    user_ident = request.data.get('enrollment_no') or request.data.get('user_id') or request.data.get('username')
    book_ident = request.data.get('isbn') or request.data.get('book_code') or request.data.get('book_id')

    issue = None
    if issue_id:
        issue = Issue.objects.filter(id=issue_id, status__in=['issued', 'overdue']).first()
    elif user_ident and book_ident:
        user = find_user(user_ident)
        book = find_book(book_ident)
        if user and book:
            issue = Issue.objects.filter(user=user, book=book, status__in=['issued', 'overdue']).first()

    if not issue:
        return Response({
            'error': 'Active checkout record not found for the specified student and book.'
        }, status=status.HTTP_404_NOT_FOUND)

    book = issue.book
    today = date.today()
    issue.return_date = today

    # Fine calculation
    fine = issue.calculate_current_fine()
    issue.fine_amount = fine
    issue.status = 'returned'
    issue.save()

    # Increase available copies
    book.available_copies = min(book.total_copies, book.available_copies + 1)
    book.save(update_fields=['available_copies'])

    # Reservation Queue: first person in queue gets status "ready"
    ready_reservation = None
    next_reservation = Reservation.objects.filter(book=book, status='waiting').order_by('created_at').first()
    if next_reservation:
        next_reservation.status = 'ready'
        next_reservation.save()
        ready_reservation = {
            'user': next_reservation.user.username,
            'name': f"{next_reservation.user.first_name} {next_reservation.user.last_name}".strip() or next_reservation.user.username,
            'enrollment_no': next_reservation.user.enrollment_no
        }

    return Response({
        'message': f"Book '{book.title}' returned successfully.",
        'fine_amount': float(fine),
        'is_overdue': fine > 0,
        'issue': IssueSerializer(issue).data,
        'reservation_ready': ready_reservation
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserve_book(request):
    book_ident = request.data.get('book_id') or request.data.get('isbn') or request.data.get('book_code')
    if not book_ident:
        return Response({'error': 'Please provide book ID or ISBN.'}, status=status.HTTP_400_BAD_REQUEST)

    book = find_book(book_ident)
    if not book:
        return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    # Rule: If copies are available, no need to reserve
    if book.available_copies > 0:
        return Response({
            'error': f"'{book.title}' currently has {book.available_copies} copies available. You can borrow it directly at the library desk."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if student already has active issue of this book
    if Issue.objects.filter(user=user, book=book, status__in=['issued', 'overdue']).exists():
        return Response({
            'error': f"You already have an active checkout for '{book.title}'."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if already reserved
    if Reservation.objects.filter(user=user, book=book, status__in=['waiting', 'ready']).exists():
        return Response({
            'error': f"You already have an active reservation for '{book.title}'."
        }, status=status.HTTP_400_BAD_REQUEST)

    reservation = Reservation.objects.create(
        user=user,
        book=book,
        status='waiting'
    )

    queue_position = Reservation.objects.filter(book=book, status='waiting', created_at__lte=reservation.created_at).count()

    return Response({
        'message': f"Reservation placed for '{book.title}'. Your position in queue: #{queue_position}.",
        'queue_position': queue_position,
        'reservation': ReservationSerializer(reservation).data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_books(request):
    user = request.user
    today = date.today()

    # Automatically flag any passed due dates as overdue
    active_issues = Issue.objects.filter(user=user).select_related('book', 'user').order_by('-issue_date')
    for issue in active_issues:
        if issue.status == 'issued' and issue.due_date < today:
            issue.status = 'overdue'
            issue.fine_amount = issue.calculate_current_fine()
            issue.save(update_fields=['status', 'fine_amount'])

    reservations = Reservation.objects.filter(
        user=user,
        status__in=['waiting', 'ready']
    ).select_related('book').order_by('created_at')

    return Response({
        'issues': IssueSerializer(active_issues, many=True).data,
        'reservations': ReservationSerializer(reservations, many=True).data,
        'active_count': active_issues.filter(status__in=['issued', 'overdue']).count(),
        'total_unpaid_fines': sum(iss.calculate_current_fine() for iss in active_issues.filter(status__in=['issued', 'overdue']))
    })

@api_view(['GET'])
@permission_classes([IsAdminOrLibrarian])
def overdue_list(request):
    today = date.today()

    # Refresh overdue statuses
    overdue_candidates = Issue.objects.filter(status='issued', due_date__lt=today)
    for candidate in overdue_candidates:
        candidate.status = 'overdue'
        candidate.fine_amount = candidate.calculate_current_fine()
        candidate.save(update_fields=['status', 'fine_amount'])

    overdues = Issue.objects.filter(status='overdue').select_related('user', 'book', 'book__subject__semester__course').order_by('due_date')

    return Response(IssueSerializer(overdues, many=True).data)
