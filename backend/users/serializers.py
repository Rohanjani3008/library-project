from rest_framework import serializers
from .models import User
from academics.models import Course, Semester

class UserSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    semester_number = serializers.IntegerField(source='semester.number', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'enrollment_no',
            'phone',
            'course',
            'semester',
            'course_name',
            'semester_number',
            'profile_photo',
        ]
        read_only_fields = ['id', 'role']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False, allow_null=True)
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'enrollment_no',
            'phone',
            'course',
            'semester',
        ]

    def validate_enrollment_no(self, value):
        if value:
            trimmed = value.strip()
            if trimmed and User.objects.filter(enrollment_no__iexact=trimmed).exists():
                raise serializers.ValidationError("A student with this enrollment number already exists.")
            return trimmed if trimmed else None
        return None

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Students only, default role=student
        user = User(
            **validated_data,
            role='student'
        )
        user.set_password(password)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'course',
            'semester',
            'profile_photo',
        ]
