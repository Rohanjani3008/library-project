from django.contrib import admin
from .models import Category, Book

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'isbn', 'subject', 'category', 'available_copies', 'total_copies')
    list_filter = ('category', 'subject__semester__course', 'subject__semester')
    search_fields = ('title', 'author', 'isbn', 'publisher')
