from django.urls import path
from .views import analytics_dashboard, book_recommendations

urlpatterns = [
    path('dashboard/', analytics_dashboard, name='analytics-dashboard'),
    path('recommended/', book_recommendations, name='analytics-recommended'),
]
