from django.urls import path
from .views import (
    issue_book,
    return_book,
    reserve_book,
    my_books,
    overdue_list,
)

urlpatterns = [
    path('issue/', issue_book, name='circulation-issue'),
    path('return/', return_book, name='circulation-return'),
    path('reserve/', reserve_book, name='circulation-reserve'),
    path('my-books/', my_books, name='circulation-my-books'),
    path('overdue/', overdue_list, name='circulation-overdue'),
]
