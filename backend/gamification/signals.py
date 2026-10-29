from django.db.models.signals import post_save
from django.dispatch import receiver
from circulation.models import Issue
from resources.models import VideoProgress, QuizAttempt
from community.models import Review
from .models import Badge, UserBadge, ReadingStreak, PointsLog

def award_badge_if_eligible(user, rule_type, current_count):
    badges = Badge.objects.filter(rule_type=rule_type, threshold__lte=current_count)
    for b in badges:
        UserBadge.objects.get_or_create(user=user, badge=b)

@receiver(post_save, sender=Issue)
def handle_issue_returned(sender, instance, created, **kwargs):
    if not created and instance.status == 'returned':
        user = instance.user

        # Points
        points = 20 if (instance.fine_amount == 0) else 5
        reason = "Returned book on time" if instance.fine_amount == 0 else "Returned overdue book"
        PointsLog.objects.create(user=user, points=points, reason=reason)

        # Streak
        streak, _ = ReadingStreak.objects.get_or_create(user=user)
        streak.record_activity()

        # Check badges
        returned_count = Issue.objects.filter(user=user, status='returned').count()
        award_badge_if_eligible(user, 'books_returned', returned_count)
        award_badge_if_eligible(user, 'streak_days', streak.current_streak)

@receiver(post_save, sender=VideoProgress)
def handle_video_progress(sender, instance, created, **kwargs):
    if instance.completed:
        user = instance.user
        PointsLog.objects.get_or_create(
            user=user,
            reason=f"Completed video: {instance.resource.title}",
            defaults={'points': 10}
        )

        streak, _ = ReadingStreak.objects.get_or_create(user=user)
        streak.record_activity()

        completed_count = VideoProgress.objects.filter(user=user, completed=True).count()
        award_badge_if_eligible(user, 'videos_completed', completed_count)
        award_badge_if_eligible(user, 'streak_days', streak.current_streak)

@receiver(post_save, sender=QuizAttempt)
def handle_quiz_attempt(sender, instance, created, **kwargs):
    if created and instance.passed:
        user = instance.user
        PointsLog.objects.create(user=user, points=20, reason=f"Passed quiz on {instance.quiz.resource.title}")

        streak, _ = ReadingStreak.objects.get_or_create(user=user)
        streak.record_activity()

        passed_count = QuizAttempt.objects.filter(user=user, passed=True).count()
        award_badge_if_eligible(user, 'quizzes_passed', passed_count)
        award_badge_if_eligible(user, 'streak_days', streak.current_streak)

@receiver(post_save, sender=Review)
def handle_review_written(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        PointsLog.objects.create(user=user, points=10, reason=f"Reviewed book {instance.book.title}")

        reviews_count = Review.objects.filter(user=user).count()
        award_badge_if_eligible(user, 'reviews_written', reviews_count)
