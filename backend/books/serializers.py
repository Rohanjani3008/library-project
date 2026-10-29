from rest_framework import serializers
from .models import Category, Book

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(source='books.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'book_count']

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    semester_id = serializers.IntegerField(source='subject.semester.id', read_only=True)
    semester_number = serializers.IntegerField(source='subject.semester.number', read_only=True)
    course_id = serializers.IntegerField(source='subject.semester.course.id', read_only=True)
    course_name = serializers.CharField(source='subject.semester.course.name', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'isbn',
            'book_code',
            'qr_code',
            'category',
            'category_name',
            'subject',
            'subject_name',
            'subject_code',
            'semester_id',
            'semester_number',
            'course_id',
            'course_name',
            'total_copies',
            'available_copies',
            'description',
            'cover_image',
            'publisher',
            'year',
            'created_at',
        ]

    def validate_isbn(self, value):
        if value:
            trimmed = value.strip()
            # If editing, allow same ISBN for current instance
            instance = getattr(self, 'instance', None)
            existing = Book.objects.filter(isbn__iexact=trimmed)
            if instance:
                existing = existing.exclude(pk=instance.pk)
            if existing.exists():
                raise serializers.ValidationError("A book with this ISBN already exists.")
            return trimmed if trimmed else None
        return None

    def validate(self, attrs):
        total = attrs.get('total_copies')
        available = attrs.get('available_copies')

        if self.instance:
            if total is None:
                total = self.instance.total_copies
            if available is None:
                available = self.instance.available_copies

        if total is not None and available is not None:
            if available > total:
                raise serializers.ValidationError({
                    'available_copies': "Available copies cannot exceed total copies."
                })
        return attrs

    def create(self, validated_data):
        if 'available_copies' not in validated_data:
            validated_data['available_copies'] = validated_data.get('total_copies', 1)
        return super().create(validated_data)
