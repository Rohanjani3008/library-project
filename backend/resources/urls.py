from django.urls import path
from .views import (
    resource_list_create,
    resource_detail,
    save_video_progress,
    continue_watching_list,
    bookmark_toggle_or_list,
    submit_quiz,
)

urlpatterns = [
    path('', resource_list_create, name='resource-list-create'),
    path('continue-watching/', continue_watching_list, name='resource-continue-watching'),
    path('bookmarks/', bookmark_toggle_or_list, name='resource-bookmarks'),
    path('quizzes/<int:quiz_id>/submit/', submit_quiz, name='quiz-submit'),
    path('<int:pk>/', resource_detail, name='resource-detail'),
    path('<int:pk>/progress/', save_video_progress, name='resource-progress'),
    path('<int:pk>/bookmark/', bookmark_toggle_or_list, name='resource-bookmark-toggle'),
]
