from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'student'
        )

class IsLibrarian(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'librarian' or request.user.is_staff or request.user.is_superuser)
        )

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser)
        )

class IsAdminOrLibrarian(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['admin', 'librarian'] or request.user.is_staff or request.user.is_superuser)
        )

class IsAdminOrLibrarianOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['admin', 'librarian'] or request.user.is_staff or request.user.is_superuser)
        )
