from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from academics.models import Course, Semester
from users.permissions import IsStudent, IsLibrarian, IsAdmin

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.course = Course.objects.create(name='Computer Science')
        self.sem1 = Semester.objects.create(course=self.course, number=1)
        self.sem2 = Semester.objects.create(course=self.course, number=2)

        # Create admin
        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@test.com',
            password='Password123!',
            role='admin'
        )

        # Create librarian
        self.librarian_user = User.objects.create_user(
            username='libuser',
            email='lib@test.com',
            password='Password123!',
            role='librarian'
        )

    def test_student_registration(self):
        payload = {
            'username': 'student1',
            'password': 'Password123!',
            'email': 'student1@test.com',
            'first_name': 'Rahul',
            'last_name': 'Sharma',
            'enrollment_no': 'EN1001',
            'phone': '9876543210',
            'course': self.course.id,
            'semester': self.sem1.id,
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'student')
        self.assertEqual(response.data['user']['enrollment_no'], 'EN1001')
        self.assertEqual(response.data['user']['course_name'], 'Computer Science')
        self.assertEqual(response.data['user']['semester_number'], 1)

    def test_login_and_token_refresh(self):
        # Register user
        User.objects.create_user(
            username='student2',
            password='Password123!',
            email='student2@test.com',
            role='student'
        )

        # Login with username
        login_response = self.client.post('/api/auth/login/', {
            'username': 'student2',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)
        self.assertEqual(login_response.data['user']['username'], 'student2')

        # Refresh token
        refresh_token = login_response.data['refresh']
        refresh_response = self.client.post('/api/auth/refresh/', {
            'refresh': refresh_token
        }, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_get_and_update_me(self):
        student = User.objects.create_user(
            username='student3',
            password='Password123!',
            email='student3@test.com',
            role='student',
            course=self.course,
            semester=self.sem1
        )
        self.client.force_authenticate(user=student)

        # GET /api/auth/me/
        get_response = self.client.get('/api/auth/me/')
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(get_response.data['username'], 'student3')
        self.assertEqual(get_response.data['course_name'], 'Computer Science')

        # PUT /api/auth/me/
        put_response = self.client.put('/api/auth/me/', {
            'first_name': 'Amit',
            'last_name': 'Verma',
            'phone': '9123456789',
            'semester': self.sem2.id,
        }, format='json')
        self.assertEqual(put_response.status_code, status.HTTP_200_OK)
        self.assertEqual(put_response.data['first_name'], 'Amit')
        self.assertEqual(put_response.data['semester_number'], 2)

    def test_permission_classes(self):
        student = User.objects.create_user(username='stu', password='p', role='student')
        librarian = User.objects.create_user(username='lib', password='p', role='librarian')
        admin = User.objects.create_user(username='adm', password='p', role='admin')

        class MockRequest:
            def __init__(self, user):
                self.user = user

        # Test IsStudent
        is_student = IsStudent()
        self.assertTrue(is_student.has_permission(MockRequest(student), None))
        self.assertFalse(is_student.has_permission(MockRequest(librarian), None))
        self.assertFalse(is_student.has_permission(MockRequest(admin), None))

        # Test IsLibrarian
        is_librarian = IsLibrarian()
        self.assertFalse(is_librarian.has_permission(MockRequest(student), None))
        self.assertTrue(is_librarian.has_permission(MockRequest(librarian), None))

        # Test IsAdmin
        is_admin = IsAdmin()
        self.assertFalse(is_admin.has_permission(MockRequest(student), None))
        self.assertFalse(is_admin.has_permission(MockRequest(librarian), None))
        self.assertTrue(is_admin.has_permission(MockRequest(admin), None))

    def test_academics_courses_list(self):
        response = self.client.get('/api/academics/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Computer Science')
        self.assertEqual(len(response.data[0]['semesters']), 2)
