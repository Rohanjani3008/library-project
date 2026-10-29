from django.urls import path
from .views import (
    my_gamification_profile,
    leaderboard,
    library_wrapped,
    generate_certificate,
)

urlpatterns = [
    path('profile/', my_gamification_profile, name='gamification-profile'),
    path('leaderboard/', leaderboard, name='gamification-leaderboard'),
    path('wrapped/', library_wrapped, name='gamification-wrapped'),
    path('certificate/<int:subject_id>/', generate_certificate, name='gamification-certificate'),
]
