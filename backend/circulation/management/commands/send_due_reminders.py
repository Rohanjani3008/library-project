from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from circulation.models import Issue
from users.models import Notification

class Command(BaseCommand):
    help = 'Sends email reminders 2 days before due date and on overdue, plus creates in-app notifications'

    def handle(self, *args, **options):
        today = date.today()
        upcoming_date = today + timedelta(days=2)

        # 1. Reminders: Due in 2 days
        upcoming_issues = Issue.objects.filter(
            status='issued',
            due_date=upcoming_date
        ).select_related('user', 'book')

        upcoming_count = 0
        for issue in upcoming_issues:
            user = issue.user
            title = f"Due in 2 Days: {issue.book.title}"
            message = (
                f"Hello {user.first_name or user.username},\n\n"
                f"This is a friendly reminder from the Smart Library that your borrowed book "
                f"'{issue.book.title}' is due for return on {issue.due_date.strftime('%B %d, %Y')}.\n"
                f"Please return or renew it to avoid daily overdue fines.\n\n"
                f"Smart Library Circulation Team"
            )

            # In-app notification
            Notification.objects.get_or_create(
                user=user,
                title=title,
                defaults={
                    'message': f"'{issue.book.title}' is due in 2 days on {issue.due_date}.",
                    'type': 'reminder',
                }
            )

            # Send Email
            if user.email:
                try:
                    send_mail(
                        subject=f"[Library Reminder] {issue.book.title} due in 2 days",
                        message=message,
                        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'library@college.edu'),
                        recipient_list=[user.email],
                        fail_silently=True,
                    )
                except Exception as e:
                    self.stderr.write(f"Failed to email {user.email}: {e}")

            upcoming_count += 1

        # 2. Overdue Notices
        overdue_issues = Issue.objects.filter(
            status__in=['issued', 'overdue'],
            due_date__lt=today
        ).select_related('user', 'book')

        overdue_count = 0
        for issue in overdue_issues:
            # Update status and fine
            issue.status = 'overdue'
            issue.fine_amount = issue.calculate_current_fine()
            issue.save(update_fields=['status', 'fine_amount'])

            user = issue.user
            days_late = (today - issue.due_date).days
            title = f"OVERDUE: {issue.book.title}"
            message = (
                f"Dear {user.first_name or user.username},\n\n"
                f"Our records show that '{issue.book.title}' was due on {issue.due_date.strftime('%B %d, %Y')} "
                f"and is currently {days_late} day(s) overdue.\n"
                f"Accumulated fine: Rs. {issue.fine_amount:.2f}.\n"
                f"Please return this volume to the library circulation desk immediately.\n\n"
                f"Smart Library Circulation Desk"
            )

            # In-app notification
            Notification.objects.create(
                user=user,
                title=title,
                message=f"'{issue.book.title}' is {days_late} days overdue. Current fine: Rs. {issue.fine_amount:.2f}.",
                type='overdue',
            )

            # Send Email
            if user.email:
                try:
                    send_mail(
                        subject=f"[OVERDUE NOTICE] Please return '{issue.book.title}'",
                        message=message,
                        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'library@college.edu'),
                        recipient_list=[user.email],
                        fail_silently=True,
                    )
                except Exception as e:
                    self.stderr.write(f"Failed to email {user.email}: {e}")

            overdue_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Reminders completed: {upcoming_count} upcoming reminders, {overdue_count} overdue notices dispatched."
        ))
