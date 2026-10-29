from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminOrLibrarian, IsAdminOrLibrarianOrReadOnly
from academics.models import Subject
from .models import Book, Category
from .serializers import BookSerializer, CategorySerializer

# Categories List & Create
@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all().prefetch_related('books')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Books List & Create with query filters and search
@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def book_list_create(request):
    if request.method == 'GET':
        books = Book.objects.all().select_related('category', 'subject__semester__course')

        # Query filters: ?subject=&semester=&course=&category=&search=
        subject_id = request.query_params.get('subject')
        semester_id = request.query_params.get('semester')
        course_id = request.query_params.get('course')
        category_id = request.query_params.get('category')
        search_query = request.query_params.get('search')

        if subject_id:
            books = books.filter(subject_id=subject_id)
        if semester_id:
            books = books.filter(subject__semester_id=semester_id)
        if course_id:
            books = books.filter(subject__semester__course_id=course_id)
        if category_id:
            books = books.filter(category_id=category_id)
        if search_query:
            q = search_query.strip()
            books = books.filter(
                Q(title__icontains=q) |
                Q(author__icontains=q) |
                Q(isbn__icontains=q) |
                Q(description__icontains=q) |
                Q(publisher__icontains=q)
            )

        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Book Detail, Update, Delete
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def book_detail(request, pk):
    book = get_object_or_404(Book.objects.select_related('category', 'subject__semester__course'), pk=pk)

    if request.method == 'GET':
        serializer = BookSerializer(book)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = BookSerializer(book, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        book.delete()
        return Response({'message': 'Book deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# Student My Syllabus: books for logged-in student's semester grouped by subject
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_syllabus_books(request):
    student = request.user

    if not student.semester:
        return Response({
            'message': 'No semester assigned to your profile. Please update your profile.',
            'syllabus': []
        })

    semester = student.semester
    subjects = Subject.objects.filter(semester=semester).order_by('name')

    syllabus_data = []
    for subj in subjects:
        subj_books = Book.objects.filter(subject=subj).select_related('category', 'subject__semester__course')
        books_data = BookSerializer(subj_books, many=True).data

        syllabus_data.append({
            'subject': {
                'id': subj.id,
                'name': subj.name,
                'code': subj.code,
                'semester_number': semester.number,
                'course_name': semester.course.name if semester.course else '',
            },
            'books': books_data
        })

    return Response(syllabus_data)

# Lookup book by unique book_code (for QR scanner)
@api_view(['GET'])
@permission_classes([AllowAny])
def book_by_code(request, code):
    book = get_object_or_404(
        Book.objects.select_related('category', 'subject__semester__course'),
        book_code__iexact=code.strip()
    )
    serializer = BookSerializer(book)
    return Response(serializer.data)

# Printable QR Sheet (HTML for direct printing or labels)
@api_view(['GET'])
@permission_classes([AllowAny])
def qr_sheet(request):
    books = Book.objects.all().order_by('id')
    # Generate QR codes for any books missing them
    for b in books:
        if not b.book_code or not b.qr_code:
            b.save()

    books_data = BookSerializer(books, many=True).data
    return Response(books_data)
