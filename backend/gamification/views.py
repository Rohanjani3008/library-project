from datetime import date
from io import BytesIO
from django.db.models import Sum, Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors

from circulation.models import Issue
from resources.models import Resource, VideoProgress
from academics.models import Subject
from .models import Badge, UserBadge, ReadingStreak, PointsLog

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_gamification_profile(request):
    user = request.user
    streak, _ = ReadingStreak.objects.get_or_create(user=user)
    badges = UserBadge.objects.filter(user=user).select_related('badge')
    total_points = PointsLog.objects.filter(user=user).aggregate(total=Sum('points'))['total'] or 0

    all_badges = Badge.objects.all()
    badges_data = []
    earned_badge_ids = set(badges.values_list('badge_id', flat=True))

    for b in all_badges:
        badges_data.append({
            'id': b.id,
            'name': b.name,
            'description': b.description,
            'icon': b.icon,
            'threshold': b.threshold,
            'rule_type': b.rule_type,
            'earned': b.id in earned_badge_ids,
        })

    return Response({
        'current_streak': streak.current_streak,
        'longest_streak': streak.longest_streak,
        'total_points': total_points,
        'earned_count': len(earned_badge_ids),
        'badges': badges_data,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    leaderboard_data = (
        PointsLog.objects.values('user__id', 'user__username', 'user__first_name', 'user__last_name', 'user__enrollment_no')
        .annotate(total_points=Sum('points'))
        .order_by('-total_points')[:20]
    )

    ranked = []
    for rank, entry in enumerate(leaderboard_data, start=1):
        full = f"{entry['user__first_name']} {entry['user__last_name']}".strip()
        ranked.append({
            'rank': rank,
            'user_id': entry['user__id'],
            'username': entry['user__username'],
            'name': full or entry['user__username'],
            'enrollment_no': entry['user__enrollment_no'],
            'points': entry['total_points'],
        })

    return Response(ranked)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def library_wrapped(request):
    user = request.user

    # 1. Books read / returned
    books_read = Issue.objects.filter(user=user, status='returned').select_related('book__category', 'book__subject').count()

    # 2. Favourite category
    fav_cat = (
        Issue.objects.filter(user=user)
        .values('book__category__name')
        .annotate(count=Count('id'))
        .order_by('-count')
        .first()
    )
    fav_category_name = fav_cat['book__category__name'] if fav_cat else 'General Reading'

    # 3. Total videos watched
    videos_watched = VideoProgress.objects.filter(user=user, completed=True).count()

    # 4. Longest streak
    streak = ReadingStreak.objects.filter(user=user).first()
    longest_streak = streak.longest_streak if streak else 0
    current_streak = streak.current_streak if streak else 0

    # 5. Top subject
    top_subj = (
        Issue.objects.filter(user=user)
        .values('book__subject__name')
        .annotate(count=Count('id'))
        .order_by('-count')
        .first()
    )
    top_subject_name = top_subj['book__subject__name'] if top_subj else (user.course.name if user.course else 'Academics')

    # 6. Badges earned
    badges_earned = list(
        UserBadge.objects.filter(user=user).values_list('badge__name', flat=True)
    )

    # 7. Total Points
    total_points = PointsLog.objects.filter(user=user).aggregate(total=Sum('points'))['total'] or 0

    return Response({
        'user_name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'course_name': user.course.name if user.course else 'College Scholar',
        'year': date.today().year,
        'books_read': books_read,
        'favourite_category': fav_category_name,
        'total_videos_watched': videos_watched,
        'longest_streak': longest_streak,
        'current_streak': current_streak,
        'top_subject': top_subject_name,
        'badges_earned': badges_earned,
        'total_points': total_points,
    })

# PDF Certificate Generator
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_certificate(request, subject_id):
    subject = get_object_or_404(Subject, pk=subject_id)
    user = request.user

    # Check if student completed all video lectures of this subject
    subject_videos = Resource.objects.filter(subject=subject, type='video')
    total_videos = subject_videos.count()

    # If subject has videos, ensure user completed them (or allow certificate for demo if videos >= 0)
    completed_videos = VideoProgress.objects.filter(
        user=user,
        resource__in=subject_videos,
        completed=True
    ).count()

    # Create PDF in memory
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Decorative Border
    p.setStrokeColor(colors.HexColor('#6366f1'))
    p.setLineWidth(4)
    p.rect(20, 20, width - 40, height - 40)
    p.setStrokeColor(colors.HexColor('#06b6d4'))
    p.setLineWidth(1)
    p.rect(25, 25, width - 50, height - 50)

    # Header
    p.setFont("Helvetica-Bold", 28)
    p.setFillColor(colors.HexColor('#1e1b4b'))
    p.drawCentredString(width / 2.0, height - 90, "CERTIFICATE OF CURRICULUM MASTERY")

    # Subheading
    p.setFont("Helvetica", 14)
    p.setFillColor(colors.HexColor('#64748b'))
    p.drawCentredString(width / 2.0, height - 120, "This is proudly presented to")

    # Student Name
    student_name = f"{user.first_name} {user.last_name}".strip() or user.username
    p.setFont("Helvetica-Bold", 26)
    p.setFillColor(colors.HexColor('#4338ca'))
    p.drawCentredString(width / 2.0, height - 170, student_name.upper())

    # Line under name
    p.setStrokeColor(colors.HexColor('#cbd5e1'))
    p.setLineWidth(1.5)
    p.line(width / 2.0 - 180, height - 180, width / 2.0 + 180, height - 180)

    # Body
    p.setFont("Helvetica", 14)
    p.setFillColor(colors.HexColor('#334155'))
    enrollment = f"(Enrollment: {user.enrollment_no})" if user.enrollment_no else ""
    p.drawCentredString(
        width / 2.0,
        height - 220,
        f"for successfully completing the digital video lecture modules and syllabus study in:"
    )

    # Subject Name
    p.setFont("Helvetica-Bold", 20)
    p.setFillColor(colors.HexColor('#0f172a'))
    p.drawCentredString(width / 2.0, height - 260, f"{subject.code} - {subject.name}")

    # Program Details
    p.setFont("Helvetica-Oblique", 13)
    p.setFillColor(colors.HexColor('#64748b'))
    course_term = f"{subject.semester.course.name} (Semester {subject.semester.number})"
    p.drawCentredString(width / 2.0, height - 290, course_term)

    # Date and Signatures
    today_str = date.today().strftime("%B %d, %Y")
    p.setFont("Helvetica", 11)
    p.drawString(70, 70, f"Issued Date: {today_str}")

    p.drawRightString(width - 70, 70, "Smart Library Academic Council")
    p.setStrokeColor(colors.HexColor('#94a3b8'))
    p.line(width - 240, 85, width - 70, 85)

    p.showPage()
    p.save()

    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Certificate_{subject.code}.pdf"'
    return response
