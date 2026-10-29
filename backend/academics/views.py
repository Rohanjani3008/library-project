from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.permissions import IsAdminOrLibrarianOrReadOnly
from .models import Course, Semester, Subject
from .serializers import CourseSerializer, SemesterSerializer, SubjectSerializer

# Course Views
@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def course_list_create(request):
    if request.method == 'GET':
        courses = Course.objects.all().prefetch_related('semesters__subjects')
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk)

    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = CourseSerializer(course, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        course.delete()
        return Response({'message': 'Course deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# Semester Views
@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def semester_list_create(request):
    if request.method == 'GET':
        semesters = Semester.objects.all().select_related('course').prefetch_related('subjects')
        course_id = request.query_params.get('course')
        if course_id:
            semesters = semesters.filter(course_id=course_id)
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = SemesterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def semester_detail(request, pk):
    semester = get_object_or_404(Semester, pk=pk)

    if request.method == 'GET':
        serializer = SemesterSerializer(semester)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = SemesterSerializer(semester, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        semester.delete()
        return Response({'message': 'Semester deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# Subject Views
@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def subject_list_create(request):
    if request.method == 'GET':
        subjects = Subject.objects.all().select_related('semester__course')
        semester_id = request.query_params.get('semester')
        course_id = request.query_params.get('course')

        if semester_id:
            subjects = subjects.filter(semester_id=semester_id)
        if course_id:
            subjects = subjects.filter(semester__course_id=course_id)

        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminOrLibrarianOrReadOnly])
def subject_detail(request, pk):
    subject = get_object_or_404(Subject, pk=pk)

    if request.method == 'GET':
        serializer = SubjectSerializer(subject)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = SubjectSerializer(subject, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        subject.delete()
        return Response({'message': 'Subject deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# Exam Season Mode status & admin toggle
@api_view(['GET', 'POST'])
def exam_season_view(request):
    from .models import ExamSeason
    if request.method == 'GET':
        active_season = ExamSeason.objects.filter(is_active=True).first()
        if not active_season:
            return Response({'is_active': False, 'season': None})
        return Response({
            'is_active': True,
            'season': {
                'id': active_season.id,
                'title': active_season.title,
                'start_date': active_season.start_date,
                'end_date': active_season.end_date,
                'short_loan_days': active_season.short_loan_days,
            }
        })

    elif request.method == 'POST':
        if not request.user.is_authenticated or (request.user.role != 'admin' and not request.user.is_superuser):
            return Response({'error': 'Only Admin can update Exam Season Mode.'}, status=status.HTTP_403_FORBIDDEN)

        is_active = request.data.get('is_active', True)
        title = request.data.get('title', 'Final Examinations 2026')
        from datetime import date, timedelta
        start = request.data.get('start_date') or date.today()
        end = request.data.get('end_date') or (date.today() + timedelta(days=30))

        ExamSeason.objects.all().update(is_active=False)
        season, _ = ExamSeason.objects.update_or_create(
            title=title,
            defaults={
                'start_date': start,
                'end_date': end,
                'is_active': is_active,
                'short_loan_days': int(request.data.get('short_loan_days', 7)),
            }
        )

        return Response({
            'message': f"Exam Season Mode {'activated' if is_active else 'deactivated'}.",
            'is_active': is_active
        })
