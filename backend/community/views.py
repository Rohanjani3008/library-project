from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminOrLibrarian
from books.models import Book
from academics.models import Subject
from .models import Review, SeniorNote, BookRequest
from .serializers import ReviewSerializer, SeniorNoteSerializer, BookRequestSerializer

# Reviews API
@api_view(['GET', 'POST'])
def review_list_create(request):
    if request.method == 'GET':
        book_id = request.query_params.get('book')
        reviews = Review.objects.all().select_related('user', 'book')
        if book_id:
            reviews = reviews.filter(book_id=book_id)

        serializer = ReviewSerializer(reviews, many=True)
        # Calculate summary statistics
        avg_rating = 0
        if reviews.exists():
            avg_rating = round(sum(r.rating for r in reviews) / reviews.count(), 1)

        return Response({
            'count': reviews.count(),
            'average_rating': avg_rating,
            'reviews': serializer.data
        })

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required to post a review.'}, status=status.HTTP_401_UNAUTHORIZED)

        book_id = request.data.get('book')
        book = get_object_or_404(Book, pk=book_id)

        review, created = Review.objects.update_or_create(
            user=request.user,
            book=book,
            defaults={
                'rating': int(request.data.get('rating', 5)),
                'comment': request.data.get('comment', '').strip(),
            }
        )

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

# Senior Notes API
@api_view(['GET', 'POST'])
def senior_notes_list_create(request):
    if request.method == 'GET':
        notes = SeniorNote.objects.all().select_related('user', 'subject')

        # Filter by approval status: regular users only see approved notes
        is_staff = request.user.is_authenticated and (request.user.role in ['librarian', 'admin'] or request.user.is_staff)
        include_pending = is_staff and request.query_params.get('all') == '1'

        if not include_pending:
            notes = notes.filter(approved=True)

        subject_id = request.query_params.get('subject')
        semester_id = request.query_params.get('semester')

        if subject_id:
            notes = notes.filter(subject_id=subject_id)
        if semester_id:
            notes = notes.filter(subject__semester_id=semester_id)

        return Response(SeniorNoteSerializer(notes, many=True).data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = SeniorNoteSerializer(data=request.data)
        if serializer.is_valid():
            # Auto-approve if librarian/admin, else pending
            is_staff = request.user.role in ['librarian', 'admin'] or request.user.is_staff
            note = serializer.save(user=request.user, approved=is_staff)
            return Response({
                'message': 'Senior note posted successfully.' if is_staff else 'Note submitted! It will appear once approved by a librarian.',
                'note': SeniorNoteSerializer(note).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_senior_note(request, pk):
    note = get_object_or_404(SeniorNote, pk=pk)
    note.likes += 1
    note.save(update_fields=['likes'])
    return Response({'likes': note.likes})

@api_view(['PATCH'])
@permission_classes([IsAdminOrLibrarian])
def moderate_senior_note(request, pk):
    note = get_object_or_404(SeniorNote, pk=pk)
    approved = request.data.get('approved', True)
    note.approved = approved
    note.save(update_fields=['approved'])
    return Response(SeniorNoteSerializer(note).data)

# Book Requests API
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def book_requests_list_create(request):
    user = request.user
    is_staff = user.role in ['librarian', 'admin'] or user.is_staff

    if request.method == 'GET':
        if is_staff:
            requests = BookRequest.objects.all().select_related('user')
        else:
            requests = BookRequest.objects.filter(user=user)

        return Response(BookRequestSerializer(requests, many=True).data)

    elif request.method == 'POST':
        serializer = BookRequestSerializer(data=request.data)
        if serializer.is_valid():
            req = serializer.save(user=user, status='pending')
            return Response({
                'message': 'Book request submitted to library staff.',
                'request': BookRequestSerializer(req).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAdminOrLibrarian])
def moderate_book_request(request, pk):
    req = get_object_or_404(BookRequest, pk=pk)
    new_status = request.data.get('status')
    librarian_note = request.data.get('librarian_note', '')

    if new_status in ['pending', 'approved', 'rejected']:
        req.status = new_status
    if librarian_note:
        req.librarian_note = librarian_note
    req.save()

    return Response(BookRequestSerializer(req).data)
