from django.contrib import admin
from .models import Badge, UserBadge, ReadingStreak, PointsLog

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'rule_type', 'threshold', 'icon')

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'badge', 'earned_at')

@admin.register(ReadingStreak)
class ReadingStreakAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'current_streak', 'longest_streak', 'last_activity_date')

@admin.register(PointsLog)
class PointsLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'points', 'reason', 'created_at')
