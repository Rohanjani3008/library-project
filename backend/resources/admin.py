from django.contrib import admin
from .models import Resource, Playlist, PlaylistItem, VideoProgress, Bookmark, Quiz, Question, QuizAttempt

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'resource')
    inlines = [QuestionInline]

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'type', 'subject', 'uploaded_by', 'created_at')
    list_filter = ('type', 'subject__semester__course', 'subject')
    search_fields = ('title', 'description')

admin.site.register(VideoProgress)
admin.site.register(Bookmark)
admin.site.register(QuizAttempt)
