# Syllabus-based Smart Library & Learning Platform

## 1. Project Overview & Core Concept
The **Syllabus-based Smart Library & Learning Platform** is a college-focused web application designed to bridge traditional library circulation with academic learning resources. 

**Core Idea:**
Students select their **Course** and **Semester** to immediately access curated physical books, e-books, video lectures, and notes mapped specifically to their subjects and syllabus.

---

## 2. User Roles & Permissions
- **Student**:
  - Browse syllabus-mapped subjects, books, e-books, and video lectures.
  - Track reading progress and lecture completion.
  - Issue/return books using QR codes, reserve books, and check fines.
  - Request new books, leave reviews, and access Senior's Corner.
  - Earn badges, maintain reading streaks, and view an annual "Library Wrapped" summary.
  - Switch to "Exam Season Mode" for prioritized high-yield study materials.
- **Librarian**:
  - Manage book inventory, cataloging, copies, and shelf locations.
  - Process book issues, returns, and renewals (including QR scanning).
  - Manage reservations queue and collect/waive overdue fines.
  - Monitor inventory health and approve student book requests.
- **Admin**:
  - Manage users, roles, courses, branches, semesters, and subjects.
  - Oversee platform analytics, system logs, and library usage reports.
  - Manage platform configurations.

---

## 3. Technology Stack
- **Frontend**: React (Vite)
- **Backend**: Django & Django REST Framework (DRF)
- **Authentication**: JWT Auth (`djangorestframework-simplejwt`)
- **Database**: SQLite in development, transitioning to PostgreSQL for production
- **Media & File Storage**: Cloudinary (Book covers, PDF notes, user avatars)
- **Video Delivery**: YouTube embeds for curated video lectures
- **Styling & UI**: Modern, responsive CSS with dark mode support and mobile-first design

---

## 4. Planned Features
1. **Syllabus-wise Categorization**: Mapped by Course -> Branch/Department -> Semester -> Subject.
2. **QR Code Issue & Return**: Fast, contactless circulation management for students and librarians.
3. **Reservation Queue & Fines**: Automated queue for checked-out books, automated daily overdue fine calculation.
4. **Digital Resources & Progress Tracking**: E-books and embedded YouTube video lectures with watch/read progress percentages.
5. **Reviews & Ratings**: Student reviews and ratings on books and academic materials.
6. **Senior's Corner**: Student-contributed tips, handwritten notes, previous year question papers (PYQs), and guidance.
7. **Book Requests**: Formal request workflow for acquiring books not currently in the library catalog.
8. **Gamification (Badges & Streaks)**: Reading streaks, milestones, activity badges, and leaderboards.
9. **"Library Wrapped"**: Shareable summary card visualizing annual reading stats, favorite subjects, and hours invested.
10. **Analytics Dashboard**: Real-time stats for librarians/admins (popular books, peak hours, active users) and students (personal learning habits).
11. **Smart Recommendations**: Rule-based and collaborative book recommendations tailored to current semester subjects.
12. **Email Reminders**: Automated alerts for due dates, reservations available for pickup, and overdue notices.
13. **Exam Season Mode**: Quick-toggle UI view prioritizing past papers, formula sheets, key references, and crash-course videos.
14. **Dark Mode & Responsive UI**: Seamless viewing across mobile phones, tablets, and desktops.

---

## 5. Architectural Directory Structure

```text
library-project/
├── backend/
│   ├── manage.py
│   ├── core/                  # Project configuration & settings
│   └── apps/ (or top-level apps)
│       ├── users/             # Custom User model, Roles (Student/Librarian/Admin), JWT Auth
│       ├── academics/         # Courses, Semesters, Subjects, Syllabus mappings
│       ├── books/             # Physical book catalog, copies, authors, publishers
│       ├── circulation/       # Issue/return logs, reservations queue, fines, QR handling
│       ├── resources/         # E-books, notes (Cloudinary), YouTube video lectures, progress tracking
│       ├── community/         # Senior's Corner, book reviews, book requests
│       ├── gamification/      # Streaks, badges, points, Library Wrapped generation
│       └── analytics/         # Usage statistics, charts data, recommendation engine
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/               # API clients, Axios instances, endpoint definitions
│       ├── components/        # Reusable UI components (Navbar, Modals, Cards, QR reader/generator)
│       ├── context/           # React Contexts (AuthContext, ThemeContext, etc.)
│       ├── routes/            # App routes and Role-based Route Guards
│       └── pages/
│           ├── student/       # Student dashboard, syllabus view, resources, profile, wrapped
│           ├── librarian/     # Circulation desk, inventory manager, QR scanner, fine desk
│           └── admin/         # Academic structure management, user administration, analytics
│
├── PROJECT_CONTEXT.md         # Master project blueprint and guidelines
└── README.md
```

---

## 6. Development Rules & Guidelines
- **Clean & Commented Code**: Write clear, easy-to-follow code with simple explanations.
- **Modular Development**: Build incrementally, focusing on one feature at a time without jumping ahead.
- **Security & Validation**: Handle role-based access control (Student, Librarian, Admin) using straightforward checks.

---

## 7. Coding Style Rules (Strictly Follow for ALL Tasks)
1. **Target Skill Level**: Write code like a second-year college student who knows basic Django and React. Keep it simple, straightforward, and readable.
2. **Simple Backend Patterns**: Prefer plain function-based views (e.g., `@api_view`) and simple serializers. Avoid advanced patterns: no metaclasses, no custom decorators, no abstract base classes, no heavy generics, and no over-engineering.
3. **Simple React Components**: In React, use only functional components with `useState`, `useEffect`, and `useContext`. Keep components small. Use simple names like `handleSubmit`, `bookList`, `loading`.
4. **Variable Naming & Typing**: Use normal, everyday variable names. Do not write long docstrings or type hints everywhere.
5. **Comments**: Keep comments short and in simple English, only where logic is not obvious (e.g., `# fine = days late * 2`). No comment on every line, and no decorative comment banners.
6. **Repetitive Over Clever**: Keep code slightly repetitive rather than clever. It is totally fine to repeat small pieces of code instead of building complicated abstractions.
7. **Scope & File Size**: One feature at a time, with small files. Do not add extra features that were not explicitly requested.
8. **No Emojis**: Do not add emojis in code or comments.
9. **Viva Preparation (Hinglish)**: After each task, explain in simple Hindi-English (Hinglish) which file does what and how it works, so the concepts can be confidently answered in college viva exams.

