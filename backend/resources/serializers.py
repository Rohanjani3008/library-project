from rest_framework import serializers
from .models import Resource, Playlist, PlaylistItem, VideoProgress, Bookmark, Quiz, Question, QuizAttempt

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question', 'option_a', 'option_b', 'option_c', 'option_d']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'resource', 'title', 'description', 'questions']

class ResourceSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    semester_id = serializers.IntegerField(source='subject.semester.id', read_only=True)
    semester_number = serializers.IntegerField(source='subject.semester.number', read_only=True)
    course_name = serializers.CharField(source='subject.semester.course.name', read_only=True)
    auto_thumbnail = serializers.CharField(read_only=True)
    youtube_id = serializers.CharField(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    quizzes = QuizSerializer(many=True, read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id',
            'title',
            'description',
            'type',
            'subject',
            'subject_name',
            'subject_code',
            'semester_id',
            'semester_number',
            'course_name',
            'file_url',
            'video_url',
            'thumbnail',
            'auto_thumbnail',
            'youtube_id',
            'uploaded_by',
            'is_bookmarked',
            'progress',
            'quizzes',
            'created_at',
        ]

    def get_is_bookmarked(self, obj):
        request = self.context.get('request', None)
        user = request.user if request else None
        if user and user.is_authenticated:
            return Bookmark.objects.filter(user=user, resource=obj).exists()
        return False

    def get_progress(self, obj):
        request = self.context.get('request', None)
        user = request.user if request else None
        if user and user.is_authenticated and obj.type == 'video':
            vp = VideoProgress.objects.filter(user=user, resource=obj).first()
            if vp:
                return {
                    'watched_percent': vp.watched_percent,
                    'last_position': vp.last_position,
                    'completed': vp.completed,
                }
        return None

class VideoProgressSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_thumbnail = serializers.CharField(source='resource.auto_thumbnail', read_only=True)
    subject_name = serializers.CharField(source='resource.subject.name', read_only=True)

    class Meta:
        model = VideoProgress
        fields = [
            'id',
            'resource',
            'resource_title',
            'resource_thumbnail',
            'subject_name',
            'watched_percent',
            'last_position',
            'completed',
            'updated_at',
        ]

class BookmarkSerializer(serializers.ModelSerializer):
    resource = ResourceSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'resource', 'created_at']
