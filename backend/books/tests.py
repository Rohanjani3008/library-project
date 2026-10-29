from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from academics.models import Course, Semester, Subject
from books.models import Category, Book

User = get_user_model()

class BooksAndAcademicsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.admin = User.objects.create_superuser(
            username='admin_test',
            password='Password123!',
            email='admin@test.com',
            role='admin'
        )
        self.librarian = User.objects.create_user(
            username='librarian_test',
            password='Password123!',
            email='librarian@test.com',
            role='librarian'
        )

        # Academics
        self.course = Course.objects.create(name='Test Course')
        self.sem1 = Semester.objects.create(course=self.course, number=1)
        self.subject1 = Subject.objects.create(semester=self.sem1, name='Programming', code='TC101')
        self.subject2 = Subject.objects.create(semester=self.sem1, name='Maths', code='TC102')

        self.student = User.objects.create_user(
            username='student_test',
            password='Password123!',
            email='student@test.com',
            role='student',
            course=self.course,
            semester=self.sem1
        )

        # Category and Books
        self.cat = Category.objects.create(name='Computer Science')
        self.book1 = Book.objects.create(
            title='Intro to C',
            author='Dennis Ritchie',
            isbn='111-222',
            category=self.cat,
            subject=self.subject1,
            total_copies=5,
            available_copies=4,
            publisher='Pearson',
            year=2020
        )
        self.book2 = Book.objects.create(
            title='Discrete Mathematics',
            author='Kenneth Rosen',
            isbn='333-444',
            category=self.cat,
            subject=self.subject2,
            total_copies=3,
            available_copies=3,
            publisher='McGraw Hill',
            year=2021
        )

    def test_books_list_and_filters(self):
        # Public listing
        res = self.client.get('/api/books/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

        # Filter by search
        res = self.client.get('/api/books/?search=Ritchie')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['title'], 'Intro to C')

        # Filter by subject
        res = self.client.get(f'/api/books/?subject={self.subject1.id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['isbn'], '111-222')

    def test_my_syllabus_endpoint(self):
        # Anonymous should be 401
        res = self.client.get('/api/books/my-syllabus/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Logged in student
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/books/my-syllabus/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # 2 subjects in semester 1
        self.assertEqual(len(res.data), 2)
        # Check books are grouped under subjects
        subj_names = [group['subject']['name'] for group in res.data]
        self.assertIn('Programming', subj_names)
        self.assertIn('Maths', subj_names)

    def test_book_crud_permissions(self):
        payload = {
            'title': 'New Book',
            'author': 'Jane Doe',
            'isbn': '999-888',
            'total_copies': 4,
            'available_copies': 4,
        }

        # Anonymous cannot create
        res = self.client.post('/api/books/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Student cannot create
        self.client.force_authenticate(user=self.student)
        res = self.client.post('/api/books/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Librarian can create
        self.client.force_authenticate(user=self.librarian)
        res = self.client.post('/api/books/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        book_id = res.data['id']

        # Librarian can update
        update_res = self.client.patch(f'/api/books/{book_id}/', {'title': 'Updated Title'}, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['title'], 'Updated Title')

        # Librarian can delete
        del_res = self.client.delete(f'/api/books/{book_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

    def test_academics_crud(self):
        # Read is public
        res = self.client.get('/api/academics/subjects/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

        # Write requires admin/librarian
        self.client.force_authenticate(user=self.student)
        res = self.client.post('/api/academics/subjects/', {'semester': self.sem1.id, 'name': 'Chem', 'code': 'CH101'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        res = self.client.post('/api/academics/subjects/', {'semester': self.sem1.id, 'name': 'Chem', 'code': 'CH101'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
