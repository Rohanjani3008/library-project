from rest_framework import serializers
from .models import Review, SeniorNote, BookRequest

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'book', 'book_title', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username

class SeniorNoteSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = SeniorNote
        fields = [
            'id',
            'user',
            'user_name',
            'subject',
            'subject_name',
            'subject_code',
            'title',
            'tip',
            'file_or_link',
            'approved',
            'likes',
            'created_at',
        ]
        read_only_fields = ['user', 'likes']

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username

class BookRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = BookRequest
        fields = [
            'id',
            'user',
            'user_name',
            'title',
            'author',
            'reason',
            'status',
            'librarian_note',
            'created_at',
        ]
        read_only_fields = ['user']

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username
