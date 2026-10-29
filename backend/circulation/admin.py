from django.contrib import admin
from .models import Issue, Reservation

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'issue_date', 'due_date', 'return_date', 'status', 'fine_amount')
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('user__username', 'user__enrollment_no', 'book__title', 'book__book_code')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'book__title')
