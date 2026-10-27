# Syllabus-based Smart Library & Learning Platform

A college library and learning management web application built with Django REST Framework (Backend) and React with Vite (Frontend).

---

## Project Structure

```text
library-project/
├── backend/                  # Django backend
│   ├── config/               # Main Django settings and URLs
│   ├── users/                # User authentication & role management
│   ├── academics/            # Courses, semesters, subjects, syllabus mapping
│   ├── books/                # Physical books and copies catalog
│   ├── circulation/          # Issue, return, fines, reservations queue
│   ├── resources/            # E-books, notes, video lectures, progress tracking
│   ├── community/            # Senior's corner, reviews, book requests
│   ├── gamification/         # Streaks, badges, library wrapped
│   ├── analytics/            # Statistics, charts, recommendations
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # React (Vite) frontend
│   ├── src/
│   │   ├── api/              # Axios API client
│   │   ├── components/       # Shared reusable components
│   │   ├── pages/            # Student, Librarian, and Admin pages
│   │   ├── context/          # React context providers
│   │   └── routes/           # App route configurations
│   ├── package.json
│   └── vite.config.js
│
├── PROJECT_CONTEXT.md        # Detailed project roadmap and coding style rules
└── README.md                 # Setup and run instructions
```

---

## Setup & Running Instructions

### 1. Backend (Django)

1. Open a terminal and move to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Activate the Python virtual environment:
   - On Windows:
     ```powershell
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install requirements (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   The backend will be available at: `http://127.0.0.1:8000/`  
   Health check endpoint: `http://127.0.0.1:8000/api/health/`

---

### 2. Frontend (React + Vite)

1. Open a new terminal and move to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at: `http://localhost:5173/`

---

## Verification
When both the backend (`python manage.py runserver`) and frontend (`npm run dev`) are running, open `http://localhost:5173` in your browser. The page will display:
```
Status: Backend connected
```
