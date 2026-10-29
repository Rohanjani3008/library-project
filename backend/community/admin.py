from django.contrib import admin
from .models import Review, SeniorNote, BookRequest

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')

@admin.register(SeniorNote)
class SeniorNoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'subject', 'user', 'approved', 'likes', 'created_at')
    list_filter = ('approved', 'subject__semester__course', 'subject')

@admin.register(BookRequest)
class BookRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
