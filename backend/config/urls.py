from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from analytics.views import book_recommendations
from gamification.views import library_wrapped

# Health check view to verify backend connection
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),

    # Core App APIs
    path('api/auth/', include('users.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/books/recommended/', book_recommendations, name='books-recommended-top'),
    path('api/books/', include('books.urls')),
    path('api/circulation/', include('circulation.urls')),
    path('api/', include('circulation.urls')), # aliases for /api/issue/, /api/return/, /api/reserve/, /api/my-books/, /api/overdue/
    path('api/resources/', include('resources.urls')),
    path('api/community/', include('community.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/wrapped/', library_wrapped, name='library-wrapped-top'),
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
