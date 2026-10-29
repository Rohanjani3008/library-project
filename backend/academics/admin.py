from django.contrib import admin
from .models import Course, Semester, Subject

class SubjectInline(admin.TabularInline):
    model = Subject
    extra = 1

class SemesterInline(admin.TabularInline):
    model = Semester
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    inlines = [SemesterInline]

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'number')
    list_filter = ('course',)
    inlines = [SubjectInline]

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'semester')
    list_filter = ('semester__course', 'semester')
    search_fields = ('name', 'code')
