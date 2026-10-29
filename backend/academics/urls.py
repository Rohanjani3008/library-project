from django.urls import path
from .views import (
    course_list_create,
    course_detail,
    semester_list_create,
    semester_detail,
    subject_list_create,
    subject_detail,
    exam_season_view,
)

urlpatterns = [
    # Courses
    path('courses/', course_list_create, name='course-list-create'),
    path('courses/<int:pk>/', course_detail, name='course-detail'),

    # Semesters
    path('semesters/', semester_list_create, name='semester-list-create'),
    path('semesters/<int:pk>/', semester_detail, name='semester-detail'),

    # Subjects
    path('subjects/', subject_list_create, name='subject-list-create'),
    path('subjects/<int:pk>/', subject_detail, name='subject-detail'),

    # Exam Season Mode
    path('exam-season/', exam_season_view, name='academic-exam-season'),
]
