from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Semester(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='semesters')
    number = models.PositiveIntegerField()

    class Meta:
        unique_together = ('course', 'number')
        ordering = ['course', 'number']

    def __str__(self):
        return f"{self.course.name} - Semester {self.number}"

class Subject(models.Model):
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30)

    class Meta:
        ordering = ['semester', 'name']
        unique_together = ('semester', 'code')

    def __str__(self):
        return f"{self.code} - {self.name}"

class ExamSeason(models.Model):
    title = models.CharField(max_length=150, default='End Semester Examinations')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    short_loan_days = models.PositiveIntegerField(default=7)

    def __str__(self):
        return f"{self.title} ({'Active' if self.is_active else 'Inactive'})"
