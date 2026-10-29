from datetime import date
from django.conf import settings
from django.db import models
from books.models import Book

class Issue(models.Model):
    STATUS_CHOICES = (
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='issues'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='issues'
    )
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='issued')

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.book.title} issued to {self.user.username}"

    def calculate_current_fine(self):
        fine_rate = getattr(settings, 'FINE_PER_DAY', 2)
        end_date = self.return_date or date.today()
        if end_date > self.due_date:
            days_late = (end_date - self.due_date).days
            return days_late * fine_rate
        return 0

    @property
    def days_remaining(self):
        if self.status == 'returned':
            return 0
        diff = (self.due_date - date.today()).days
        return diff

class Reservation(models.Model):
    STATUS_CHOICES = (
        ('waiting', 'Waiting'),
        ('ready', 'Ready for Pickup'),
        ('cancelled', 'Cancelled'),
        ('fulfilled', 'Fulfilled'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reservation: {self.book.title} for {self.user.username} ({self.status})"
