import re
from django.conf import settings
from django.db import models
from academics.models import Subject

def extract_youtube_id(url):
    if not url:
        return ''
    match = re.search(r'(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})', url)
    return match.group(1) if match else ''

class Resource(models.Model):
    TYPE_CHOICES = (
        ('ebook', 'E-Book'),
        ('video', 'Video Lecture'),
        ('notes', 'Lecture Notes / PDF'),
        ('image', 'Diagram / Infographic'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='notes')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='resources')
    file_url = models.FileField(upload_to='resources/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='resource_thumbnails/', blank=True, null=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_resources'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"

    @property
    def youtube_id(self):
        return extract_youtube_id(self.video_url)

    @property
    def auto_thumbnail(self):
        if self.thumbnail:
            return self.thumbnail.url
        yt_id = self.youtube_id
        if yt_id:
            return f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg"
        return ''

class Playlist(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='playlists')
    title = models.CharField(max_length=150)
    resources = models.ManyToManyField(Resource, through='PlaylistItem', related_name='playlists')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.subject.name})"

class PlaylistItem(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']
        unique_together = ('playlist', 'resource')

class VideoProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progress')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='user_progress')
    watched_percent = models.PositiveIntegerField(default=0)
    last_position = models.FloatField(default=0.0)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'resource')

    def __str__(self):
        return f"{self.user.username} - {self.resource.title} ({self.watched_percent}%)"

class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'resource')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} bookmarked {self.resource.title}"

class Quiz(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"Quiz: {self.title} for {self.resource.title}"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    option_a = models.CharField(max_length=200)
    option_b = models.CharField(max_length=200)
    option_c = models.CharField(max_length=200)
    option_d = models.CharField(max_length=200)
    correct_answer = models.CharField(max_length=1, choices=(('A','A'), ('B','B'), ('C','C'), ('D','D')))

    def __str__(self):
        return self.question[:60]

class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} scored {self.score}/{self.total_questions} on {self.quiz.title}"
