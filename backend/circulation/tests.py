from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from academics.models import Course, Semester, Subject
from books.models import Category, Book
from circulation.models import Issue, Reservation

User = get_user_model()

class CirculationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin & Librarian
        self.librarian = User.objects.create_user(
            username='lib_tester',
            email='lib@test.com',
            password='Password123!',
            role='librarian'
        )

        # Student 1 & 2
        self.student1 = User.objects.create_user(
            username='student1',
            email='s1@test.com',
            password='Password123!',
            role='student',
            enrollment_no='EN001'
        )
        self.student2 = User.objects.create_user(
            username='student2',
            email='s2@test.com',
            password='Password123!',
            role='student',
            enrollment_no='EN002'
        )

        # Academics & Category
        self.course = Course.objects.create(name='BCA')
        self.sem = Semester.objects.create(course=self.course, number=1)
        self.subject = Subject.objects.create(semester=self.sem, name='C Programming', code='BCA101')
        self.cat = Category.objects.create(name='Programming')

        # Book with 1 copy
        self.book = Book.objects.create(
            title='Programming in C',
            author='Dennis Ritchie',
            isbn='978-0131103627',
            category=self.cat,
            subject=self.subject,
            total_copies=1,
            available_copies=1
        )

    def test_issue_reduces_copies_and_enforces_limit(self):
        self.client.force_authenticate(user=self.librarian)

        # Issue book to student 1
        res = self.client.post('/api/issue/', {
            'enrollment_no': 'EN001',
            'isbn': '978-0131103627',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Verify copies reduced
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 0)

        # Try to issue again when copies = 0
        res2 = self.client.post('/api/issue/', {
            'enrollment_no': 'EN002',
            'isbn': '978-0131103627',
        })
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fine_calculation_on_overdue_return(self):
        # Create an overdue issue (due 5 days ago)
        past_due = date.today() - timedelta(days=5)
        issue = Issue.objects.create(
            user=self.student1,
            book=self.book,
            due_date=past_due,
            status='issued'
        )
        self.book.available_copies = 0
        self.book.save()

        # Fine should be 5 days * 2 = 10
        self.assertEqual(issue.calculate_current_fine(), 10)

        # Process return via librarian API
        self.client.force_authenticate(user=self.librarian)
        res = self.client.post('/api/return/', {
            'issue_id': issue.id
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['fine_amount'], 10)
        self.assertTrue(res.data['is_overdue'])

        # Book available copies restored
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 1)

    def test_reservation_queue_and_ready_status_on_return(self):
        # Student 1 borrows the single copy
        self.book.available_copies = 0
        self.book.save()
        issue = Issue.objects.create(
            user=self.student1,
            book=self.book,
            due_date=date.today() + timedelta(days=14),
            status='issued'
        )

        # Student 2 reserves the book (copies = 0)
        self.client.force_authenticate(user=self.student2)
        res_reserve = self.client.post('/api/reserve/', {
            'book_id': self.book.id
        })
        self.assertEqual(res_reserve.status_code, status.HTTP_201_CREATED)
        reservation = Reservation.objects.get(user=self.student2, book=self.book)
        self.assertEqual(reservation.status, 'waiting')

        # Librarian processes return of student 1's book
        self.client.force_authenticate(user=self.librarian)
        res_return = self.client.post('/api/return/', {
            'issue_id': issue.id
        })
        self.assertEqual(res_return.status_code, status.HTTP_200_OK)

        # Student 2's reservation should now be 'ready'
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'ready')
        self.assertEqual(res_return.data['reservation_ready']['user'], 'student2')
