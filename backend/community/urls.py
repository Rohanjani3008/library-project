from django.urls import path
from .views import (
    review_list_create,
    senior_notes_list_create,
    like_senior_note,
    moderate_senior_note,
    book_requests_list_create,
    moderate_book_request,
)

urlpatterns = [
    # Reviews
    path('reviews/', review_list_create, name='community-reviews'),

    # Senior's Corner Notes
    path('senior-notes/', senior_notes_list_create, name='community-senior-notes'),
    path('senior-notes/<int:pk>/like/', like_senior_note, name='community-senior-note-like'),
    path('senior-notes/<int:pk>/moderate/', moderate_senior_note, name='community-senior-note-moderate'),

    # Book Requests
    path('book-requests/', book_requests_list_create, name='community-book-requests'),
    path('book-requests/<int:pk>/moderate/', moderate_book_request, name='community-book-request-moderate'),
]
