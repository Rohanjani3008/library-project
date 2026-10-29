from rest_framework import serializers
from .models import Course, Semester, Subject

class SubjectSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source='semester.course.id', read_only=True)
    course_name = serializers.CharField(source='semester.course.name', read_only=True)
    semester_number = serializers.IntegerField(source='semester.number', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'semester', 'name', 'code', 'course_id', 'course_name', 'semester_number']

class SemesterSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Semester
        fields = ['id', 'course', 'course_name', 'number', 'subjects']

class CourseSerializer(serializers.ModelSerializer):
    semesters = SemesterSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'semesters']
