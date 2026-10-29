from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from academics.models import Course, Semester, Subject, ExamSeason
from books.models import Category, Book
from circulation.models import Issue, Reservation
from resources.models import Resource, Quiz, Question, VideoProgress
from community.models import Review, SeniorNote, BookRequest
from gamification.models import Badge, ReadingStreak, PointsLog
from users.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds all demo data including academics, books, QR codes, resources, community, and circulation logs'

    def handle(self, *args, **options):
        self.stdout.write("Seeding comprehensive platform data...")

        # 1. Badges
        badges_info = [
            ('First Book', 'Returned your first library book on time', 'book', 'books_returned', 1),
            ('Bookworm', 'Returned 5 physical library books', 'award', 'books_returned', 5),
            ('5 Videos Complete', 'Watched 5 curriculum video lectures to completion', 'video', 'videos_completed', 5),
            ('7-Day Streak', 'Maintained a 7-day continuous learning streak', 'fire', 'streak_days', 7),
            ('Quiz Master', 'Passed 3 subject module quizzes with score > 60%', 'star', 'quizzes_passed', 3),
            ('Top Reviewer', 'Contributed 3 peer reviews for library books', 'edit', 'reviews_written', 3),
        ]
        for name, desc, icon, rule, thresh in badges_info:
            Badge.objects.get_or_create(
                name=name,
                defaults={'description': desc, 'icon': icon, 'rule_type': rule, 'threshold': thresh}
            )

        # 2. Exam Season
        ExamSeason.objects.get_or_create(
            title='Mid-Semester Examinations 2026',
            defaults={
                'start_date': date.today() - timedelta(days=2),
                'end_date': date.today() + timedelta(days=14),
                'is_active': True,
                'short_loan_days': 7,
            }
        )

        # 3. Ensure books have book_code and QR codes
        for b in Book.objects.all():
            if not b.book_code or not b.qr_code:
                b.save()

        # 4. Students
        course_bca = Course.objects.filter(name__icontains='BCA').first()
        course_bcom = Course.objects.filter(name__icontains='BCOM').first()
        sem1_bca = Semester.objects.filter(course=course_bca, number=1).first() if course_bca else None

        student_aarav, _ = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@library.edu',
                'first_name': 'Aarav',
                'last_name': 'Patel',
                'role': 'student',
                'enrollment_no': 'BCA2024001',
                'phone': '9876501234',
                'course': course_bca,
                'semester': sem1_bca,
            }
        )
        student_aarav.set_password('student123')
        student_aarav.course = course_bca
        student_aarav.semester = sem1_bca
        student_aarav.save()

        student_rohan, _ = User.objects.get_or_create(
            username='rohan_s',
            defaults={
                'email': 'rohan@library.edu',
                'first_name': 'Rohan',
                'last_name': 'Sharma',
                'role': 'student',
                'enrollment_no': 'BCA2024002',
                'phone': '9876543210',
                'course': course_bca,
                'semester': sem1_bca,
            }
        )
        student_rohan.set_password('student123')
        student_rohan.save()

        # 5. Resources (Videos, E-books, Notes)
        c_subj = Subject.objects.filter(code='BCA101').first()
        comp_subj = Subject.objects.filter(code='BCA102').first()
        math_subj = Subject.objects.filter(code='BCA103').first()

        librarian = User.objects.filter(role='librarian').first()

        if c_subj:
            # Video 1
            res_v1, _ = Resource.objects.get_or_create(
                title='C Programming Masterclass: Variables, Loops & Functions',
                defaults={
                    'description': 'Comprehensive 40-minute introductory video covering C tokens, compilers, and functions.',
                    'type': 'video',
                    'subject': c_subj,
                    'video_url': 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
                    'uploaded_by': librarian,
                }
            )

            # Quiz for Video 1
            quiz_c, _ = Quiz.objects.get_or_create(
                resource=res_v1,
                defaults={
                    'title': 'C Syntax & Memory Fundamentals',
                    'description': 'Test your comprehension of basic C datatypes and operators.'
                }
            )
            Question.objects.get_or_create(
                quiz=quiz_c,
                question='What is the format specifier for printing an integer in C?',
                defaults={'option_a': '%f', 'option_b': '%d', 'option_c': '%c', 'option_d': '%s', 'correct_answer': 'B'}
            )
            Question.objects.get_or_create(
                quiz=quiz_c,
                question='Which symbol is used to get the memory address of a variable in C?',
                defaults={'option_a': '&', 'option_b': '*', 'option_c': '#', 'option_d': '->', 'correct_answer': 'A'}
            )
            Question.objects.get_or_create(
                quiz=quiz_c,
                question='Which of the following is NOT a valid storage class in C?',
                defaults={'option_a': 'auto', 'option_b': 'register', 'option_c': 'volatile', 'option_d': 'static', 'correct_answer': 'C'}
            )

            # E-Book Notes
            Resource.objects.get_or_create(
                title='Handwritten Unit 1 & 2 Lecture Notes: C Programming',
                defaults={
                    'description': 'Curated lecture summary notes covering pointers, arrays, and string manipulations.',
                    'type': 'notes',
                    'subject': c_subj,
                    'uploaded_by': librarian,
                }
            )

            # Video Progress for student
            VideoProgress.objects.get_or_create(
                user=student_aarav,
                resource=res_v1,
                defaults={'watched_percent': 100, 'last_position': 1200, 'completed': True}
            )

        if comp_subj:
            Resource.objects.get_or_create(
                title='Von Neumann Architecture & Computer Memory Hierarchy',
                defaults={
                    'description': 'In-depth conceptual guide to CPU registers, cache levels, and bus interfaces.',
                    'type': 'video',
                    'subject': comp_subj,
                    'video_url': 'https://www.youtube.com/watch?v=FPvK74ZkOAg',
                    'uploaded_by': librarian,
                }
            )

        # 6. Sample Circulation Issues (Active, Overdue, Returned)
        all_books = list(Book.objects.all()[:6])
        if len(all_books) >= 3:
            # Active Issue (Due in 5 days)
            Issue.objects.get_or_create(
                user=student_aarav,
                book=all_books[0],
                defaults={
                    'due_date': date.today() + timedelta(days=5),
                    'status': 'issued',
                    'fine_amount': 0,
                }
            )

            # Overdue Issue (Due 3 days ago)
            Issue.objects.get_or_create(
                user=student_aarav,
                book=all_books[1],
                defaults={
                    'due_date': date.today() - timedelta(days=3),
                    'status': 'overdue',
                    'fine_amount': 6.00,
                }
            )

            # Returned Issue
            Issue.objects.get_or_create(
                user=student_aarav,
                book=all_books[2],
                defaults={
                    'due_date': date.today() - timedelta(days=10),
                    'return_date': date.today() - timedelta(days=11),
                    'status': 'returned',
                    'fine_amount': 0,
                }
            )

            # Reservation
            if all_books[3].available_copies == 0:
                Reservation.objects.get_or_create(
                    user=student_aarav,
                    book=all_books[3],
                    defaults={'status': 'waiting'}
                )

        # 7. Sample Reviews & Community Notes
        if all_books:
            Review.objects.get_or_create(
                user=student_aarav,
                book=all_books[0],
                defaults={
                    'rating': 5,
                    'comment': 'Brilliant textbook for university exams! Chapter 4 pointer explanations are very lucid.'
                }
            )
            Review.objects.get_or_create(
                user=student_rohan,
                book=all_books[0],
                defaults={
                    'rating': 4,
                    'comment': 'Good problem sets at the end of each module. Highly recommended reference.'
                }
            )

        if c_subj:
            SeniorNote.objects.get_or_create(
                user=student_aarav,
                subject=c_subj,
                title='How to score 90+ in BCA101 C Programming Exam',
                defaults={
                    'tip': 'Focus heavily on Pointers, Dynamic Memory Allocation (malloc/calloc), and File I/O. 40% of the question paper is practical code snippets!',
                    'approved': True,
                    'likes': 14,
                }
            )

            BookRequest.objects.get_or_create(
                user=student_aarav,
                title='Head First C: A Brain-Friendly Guide',
                author='David Griffiths',
                defaults={
                    'reason': 'Great visual learning resource for beginners struggling with pointers and threads.',
                    'status': 'approved',
                    'librarian_note': 'Order approved for library acquisition under next academic grant.'
                }
            )

        # 8. Notifications
        Notification.objects.get_or_create(
            user=student_aarav,
            title='Welcome to Smart Library',
            defaults={
                'message': 'Explore your syllabus-mapped textbooks and video lectures for Semester 1.',
                'type': 'system',
                'read': False,
            }
        )

        # 9. Streak & Points
        streak, _ = ReadingStreak.objects.get_or_create(
            user=student_aarav,
            defaults={'current_streak': 4, 'longest_streak': 6, 'last_activity_date': date.today()}
        )
        PointsLog.objects.get_or_create(
            user=student_aarav,
            reason='Initial Scholar Onboarding',
            defaults={'points': 50}
        )

        self.stdout.write(self.style.SUCCESS("All platform demo data successfully seeded!"))
