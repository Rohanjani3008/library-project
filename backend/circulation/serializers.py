from rest_framework import serializers
from .models import Issue, Reservation

class IssueSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_name = serializers.SerializerMethodField()
    enrollment_no = serializers.CharField(source='user.enrollment_no', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_code = serializers.CharField(source='book.book_code', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    cover_image = serializers.ImageField(source='book.cover_image', read_only=True)
    current_fine = serializers.SerializerMethodField()
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id',
            'user',
            'user_username',
            'user_name',
            'enrollment_no',
            'user_phone',
            'book',
            'book_title',
            'book_code',
            'book_isbn',
            'book_author',
            'cover_image',
            'issue_date',
            'due_date',
            'return_date',
            'fine_amount',
            'current_fine',
            'days_remaining',
            'status',
        ]

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username

    def get_current_fine(self, obj):
        return obj.calculate_current_fine()

class ReservationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_name = serializers.SerializerMethodField()
    enrollment_no = serializers.CharField(source='user.enrollment_no', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_code = serializers.CharField(source='book.book_code', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    cover_image = serializers.ImageField(source='book.cover_image', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'user',
            'user_username',
            'user_name',
            'enrollment_no',
            'book',
            'book_title',
            'book_code',
            'book_isbn',
            'cover_image',
            'created_at',
            'status',
        ]

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username
