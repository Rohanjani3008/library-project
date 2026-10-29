from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register_view, login_view, me_view, notifications_view

urlpatterns = [
    path('register/', register_view, name='auth-register'),
    path('login/', login_view, name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/', me_view, name='auth-me'),
    path('notifications/', notifications_view, name='auth-notifications'),
    path('notifications/<int:pk>/read/', notifications_view, name='auth-notification-read'),
]
