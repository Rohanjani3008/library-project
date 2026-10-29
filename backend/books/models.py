from io import BytesIO
import qrcode
from django.core.files.base import ContentFile
from django.db import models
from academics.models import Subject

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=150)
    isbn = models.CharField(max_length=25, unique=True, blank=True, null=True)
    book_code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    qr_code = models.ImageField(upload_to='book_qrs/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='books')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='books')
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True)
    publisher = models.CharField(max_length=150, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author}"

    def generate_qr(self):
        qr = qrcode.QRCode(
            version=1,
            box_size=8,
            border=2,
        )
        qr.add_data(self.book_code)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        file_name = f"qr_{self.book_code}.png"
        self.qr_code.save(file_name, ContentFile(buffer.getvalue()), save=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        needs_save = False
        if not self.book_code:
            self.book_code = f"LIB-{self.pk:06d}"
            needs_save = True

        if not self.qr_code and self.book_code:
            self.generate_qr()
            needs_save = True

        if needs_save:
            super().save(update_fields=['book_code', 'qr_code'])
