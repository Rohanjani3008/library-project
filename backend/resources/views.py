from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminOrLibrarian, IsAdminOrLibrarianOrReadOnly
from .models import Resource, VideoProgress, Bookmark, Quiz, Question, QuizAttempt
from .serializers import (
    ResourceSerializer,
    VideoProgressSerializer,
    BookmarkSerializer,
    QuizSerializer
)

# List & Upload Resources
@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def resource_list_create(request):
    if request.method == 'GET':
        resources = Resource.objects.all().select_related('subject__semester__course')

        subject_id = request.query_params.get('subject')
        res_type = request.query_params.get('type')
        semester_id = request.query_params.get('semester')
        course_id = request.query_params.get('course')
        search = request.query_params.get('search')

        if subject_id:
            resources = resources.filter(subject_id=subject_id)
        if res_type:
            resources = resources.filter(type=res_type)
        if semester_id:
            resources = resources.filter(subject__semester_id=semester_id)
        if course_id:
            resources = resources.filter(subject__semester__course_id=course_id)
        if search:
            resources = resources.filter(title__icontains=search.strip())

        serializer = ResourceSerializer(resources, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ResourceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Resource Detail, Update, Delete
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def resource_detail(request, pk):
    resource = get_object_or_404(Resource.objects.select_related('subject__semester__course'), pk=pk)

    if request.method == 'GET':
        serializer = ResourceSerializer(resource, context={'request': request})
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = ResourceSerializer(resource, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        resource.delete()
        return Response({'message': 'Resource deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# Save Video Watch Progress
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_video_progress(request, pk):
    resource = get_object_or_404(Resource, pk=pk)
    user = request.user

    watched_percent = int(request.data.get('watched_percent', 0))
    last_position = float(request.data.get('last_position', 0.0))
    completed = request.data.get('completed', False) or (watched_percent >= 90)

    progress, _ = VideoProgress.objects.get_or_create(
        user=user,
        resource=resource,
    )
    progress.watched_percent = max(progress.watched_percent, watched_percent)
    progress.last_position = last_position
    if completed:
        progress.completed = True
    progress.save()

    return Response({
        'message': 'Progress saved',
        'progress': VideoProgressSerializer(progress).data
    })

# Student Continue-Watching List
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def continue_watching_list(request):
    user = request.user
    progresses = VideoProgress.objects.filter(
        user=user,
        watched_percent__gt=0
    ).select_related('resource__subject').order_by('-updated_at')[:8]

    return Response(VideoProgressSerializer(progresses, many=True).data)

# Bookmark Toggle & List
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bookmark_toggle_or_list(request, pk=None):
    user = request.user

    # If pk provided -> toggle
    if pk is not None or request.method == 'POST':
        target_id = pk or request.data.get('resource_id')
        resource = get_object_or_404(Resource, pk=target_id)
        bookmark = Bookmark.objects.filter(user=user, resource=resource).first()

        if bookmark:
            bookmark.delete()
            return Response({'bookmarked': False, 'message': 'Removed from bookmarks'})
        else:
            Bookmark.objects.create(user=user, resource=resource)
            return Response({'bookmarked': True, 'message': 'Added to bookmarks'})

    # Else list bookmarks
    bookmarks = Bookmark.objects.filter(user=user).select_related('resource__subject')
    return Response(BookmarkSerializer(bookmarks, many=True, context={'request': request}).data)

# Submit Quiz
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz.objects.prefetch_related('questions'), pk=quiz_id)
    user = request.user
    user_answers = request.data.get('answers', {}) # format: { question_id: "A" }

    questions = quiz.questions.all()
    total_questions = questions.count()
    if total_questions == 0:
        return Response({'error': 'This quiz has no questions.'}, status=status.HTTP_400_BAD_REQUEST)

    correct_count = 0
    feedback = []

    for q in questions:
        submitted_ans = user_answers.get(str(q.id)) or user_answers.get(q.id)
        is_correct = (submitted_ans and str(submitted_ans).upper() == q.correct_answer.upper())
        if is_correct:
            correct_count += 1
        feedback.append({
            'question_id': q.id,
            'is_correct': is_correct,
            'correct_answer': q.correct_answer,
            'submitted_answer': submitted_ans
        })

    score = int((correct_count / total_questions) * 100)
    passed = score >= 60

    attempt = QuizAttempt.objects.create(
        user=user,
        quiz=quiz,
        score=score,
        total_questions=total_questions,
        passed=passed
    )

    return Response({
        'score': score,
        'correct_count': correct_count,
        'total_questions': total_questions,
        'passed': passed,
        'feedback': feedback
    })
