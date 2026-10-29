from django.urls import path
from .views import (
    book_list_create,
    book_detail,
    my_syllabus_books,
    category_list_create,
    book_by_code,
    qr_sheet,
)

urlpatterns = [
    # Books list & create (supports ?subject=&semester=&course=&category=&search=)
    path('', book_list_create, name='book-list-create'),

    # Student my-syllabus endpoint (must precede <int:pk>)
    path('my-syllabus/', my_syllabus_books, name='my-syllabus-books'),

    # QR Sheet & Lookup endpoints
    path('qr-sheet/', qr_sheet, name='books-qr-sheet'),
    path('by-code/<str:code>/', book_by_code, name='book-by-code'),

    # Categories list & create
    path('categories/', category_list_create, name='category-list-create'),

    # Book detail, update, delete
    path('<int:pk>/', book_detail, name='book-detail'),
]
