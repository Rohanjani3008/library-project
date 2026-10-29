from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from academics.models import Course, Semester

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates default admin and librarian users, and seeds starter academic courses/semesters'

    def handle(self, *args, **options):
        # 1. Create Default Admin
        admin_username = 'admin'
        admin_email = 'admin@library.com'
        admin_password = 'admin123'

        if not User.objects.filter(username=admin_username).exists():
            User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                role='admin',
                first_name='System',
                last_name='Admin'
            )
            self.stdout.write(self.style.SUCCESS(f"Created default admin: {admin_username} / {admin_password}"))
        else:
            self.stdout.write(self.style.WARNING(f"Admin '{admin_username}' already exists"))

        # 2. Create Default Librarian
        librarian_username = 'librarian'
        librarian_email = 'librarian@library.com'
        librarian_password = 'librarian123'

        if not User.objects.filter(username=librarian_username).exists():
            librarian = User.objects.create_user(
                username=librarian_username,
                email=librarian_email,
                password=librarian_password,
                role='librarian',
                first_name='Head',
                last_name='Librarian',
                is_staff=True
            )
            self.stdout.write(self.style.SUCCESS(f"Created default librarian: {librarian_username} / {librarian_password}"))
        else:
            self.stdout.write(self.style.WARNING(f"Librarian '{librarian_username}' already exists"))

        # 3. Seed starter courses and semesters for registration dropdowns
        starter_academics = [
            ('B.Tech Computer Science', 8),
            ('B.Tech Information Technology', 8),
            ('BCA (Bachelor of Computer Applications)', 6),
            ('MCA (Master of Computer Applications)', 4),
            ('BBA (Bachelor of Business Administration)', 6),
        ]

        created_courses = 0
        for course_name, sem_count in starter_academics:
            course, created = Course.objects.get_or_create(name=course_name)
            if created:
                created_courses += 1
            for sem_num in range(1, sem_count + 1):
                Semester.objects.get_or_create(course=course, number=sem_num)

        if created_courses > 0:
            self.stdout.write(self.style.SUCCESS(f"Seeded {created_courses} starter courses and semesters"))
        else:
            self.stdout.write(self.style.SUCCESS("Starter courses and semesters are ready"))
