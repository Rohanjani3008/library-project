from datetime import date, timedelta
from django.conf import settings
from django.db import models

class Badge(models.Model):
    RULE_CHOICES = (
        ('books_returned', 'Books Returned on Time'),
        ('videos_completed', 'Video Lectures Completed'),
        ('streak_days', 'Daily Reading Streak'),
        ('quizzes_passed', 'Quizzes Passed'),
        ('reviews_written', 'Reviews Written'),
    )

    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=250)
    icon = models.CharField(max_length=50, default='award')
    rule_type = models.CharField(max_length=30, choices=RULE_CHOICES)
    threshold = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.name} ({self.rule_type} >= {self.threshold})"

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_to')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"

class ReadingStreak(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def record_activity(self):
        today = date.today()
        if self.last_activity_date == today:
            return  # already recorded for today

        if self.last_activity_date == today - timedelta(days=1):
            self.current_streak += 1
        else:
            self.current_streak = 1

        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

        self.last_activity_date = today
        self.save()

    def __str__(self):
        return f"{self.user.username}: {self.current_streak} days streak"

class PointsLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points_log')
    points = models.IntegerField(default=10)
    reason = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: +{self.points} pts ({self.reason})"
