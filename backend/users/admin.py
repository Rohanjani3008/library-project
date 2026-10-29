from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'enrollment_no', 'course', 'semester', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'course', 'semester')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Profile Info', {
            'fields': ('role', 'enrollment_no', 'phone', 'course', 'semester', 'profile_photo'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Profile Info', {
            'fields': ('role', 'enrollment_no', 'phone', 'course', 'semester', 'profile_photo'),
        }),
    )
