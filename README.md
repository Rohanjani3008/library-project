# Smart Library & Learning Platform

A full-stack, enterprise-grade college library circulation and digital learning platform built with **Django REST Framework** (Backend) and **React 19 + Vite** (Frontend). Designed for modern academic institutions to automate syllabus-based book distributions, camera-based QR code circulation, in-browser e-learning, peer review communities, gamified student motivation, and administrative intelligence.

---

## Key Modules & Features

### 1. Syllabus & Academic Catalog
- **Curriculum Architecture**: Courses, Semesters, and Subjects mapped directly to semester terms.
- **Syllabus-Aligned Catalog**: Students immediately view prescribed textbooks grouped by subject for their enrolled course and term.
- **Full Catalog Search & Filters**: Multi-parameter filtering by Course, Semester, Subject, Category, and keyword search.

### 2. Circulation & Automated Reservation Queue
- **Circulation Rules Engine**: Configurable maximum books per student (default 3), standard loan period (default 14 days), and late return fines (default Rs 2/day past due).
- **Automated Inventory Balancing**: Checkouts decrease `available_copies`; returns increase `available_copies` and compute accumulated fines.
- **Fair Reservation Queue**: When all copies of a book are borrowed (0 available), students join a FIFO reservation queue. When any copy is returned, the first student in the queue automatically receives `ready` status.
- **My Books Portal**: Real-time due date badges, remaining days countdown, active overdue indicators, fine calculation, and returned loan history.

### 3. QR Code Barcode System
- **Automated Book Code & QR**: Auto-generates unique book codes (e.g. `LIB-000001`) and companion scannable QR codes using the `qrcode` and `Pillow` engine.
- **Digital Student Library Card**: Digital identity pass with instant enrollment number QR code for desk scanning.
- **Librarian Camera Scanner**: Two-step circulation flow using `html5-qrcode`. Scan student card, then scan book QR, automatically determining whether to issue or return the book.
- **Printable QR Label Sheets**: Print-optimized sticker grid (`@media print`) for pasting labels on physical textbook covers.

### 4. Digital E-Learning Hub & Quizzes
- **Multi-Tab Learning Desk**: Switch seamlessly between physical Textbooks, E-Books (PDFs), and Video Lectures.
- **Video Lecture Streamer**: Responsive video player powered by `react-player` with chapter notes and automatic watch progress synchronization.
- **Knowledge Check Quizzes**: Interactive 4-option multiple-choice quizzes after each lecture with automated scoring, feedback banners, and gamification rewards.
- **In-Browser Document Reader**: View course PDFs directly without third-party plugins, plus personal resource bookmarks.

### 5. Community & Senior's Corner
- **Senior's Corner**: Curated study guides, formula summaries, and exam tips submitted by senior students and moderated by librarians.
- **Peer Ratings & Reviews**: Star rating system (1-5 stars) and textbook feedback from verified batchmates.
- **Book Acquisition Requests**: Students can submit procurement requests for unavailable books, complete with status tracking and librarian notes.

### 6. Gamification, Badges & Annual Wrapped
- **Reading Streaks & Points**: Automatic point awards via Django signals for timely book returns (+15 pts), completed lectures (+20 pts), passed quizzes (+25 pts), and reviews (+10 pts).
- **Badges & Leaderboard**: Unlockable achievement badges ("First Book", "5 Videos Complete", "7-Day Streak") and a monthly college-wide leaderboard.
- **Library Wrapped**: Spotify-style visual story card summarizing annual reading metrics, longest streak, favorite genre, and top subject, downloadable as an image using `html2canvas`.
- **Subject Completion Certificates**: Dynamic PDF certificate generator using `reportlab` awarded when all lectures in a subject are finished.

### 7. Campus Intelligence & Exam Season Mode
- **Analytics Dashboard**: Interactive charts with `recharts` displaying monthly issue trends (LineChart), busiest circulation weekdays (BarChart), and category demand breakdown (PieChart).
- **Smart Collaborative Recommender**: "Students who borrowed this also borrowed" co-occurrence filtering plus popular titles in the student's semester.
- **Automated Due Reminders**: Management command `send_due_reminders` dispatching notifications 2 days prior to due dates and on overdue.
- **Exam Season Mode**: One-click administrative switch activating emergency high-demand banners, highlighting exam books, and shortening loan periods (e.g. 7 days).

---

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| **System Administrator** | `admin` | `admin123` |
| **Librarian Staff** | `librarian` | `librarian123` |
| **BCA Semester 1 Student** | `student1` | `student123` |
| **BCA Semester 3 Student** | `student2` | `student123` |
| **BCOM Semester 1 Student** | `student3` | `student123` |

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup (Django)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. Populate seed data (30 books, QR codes, lectures, quizzes, and demo users)
python manage.py seed_all

# 6. Run unit tests
python manage.py test

# 7. Start local server
python manage.py runserver 8000
```
Backend will be available at: `http://localhost:8000/`

### 2. Frontend Setup (React + Vite)

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start development server
npm run dev
```
Frontend will be accessible at: `http://localhost:5173/`

---

## Screenshots & Visual Walkthrough

- **Landing Page**: Modern hero section, quick platform statistics, feature highlights, and role-based login cards.
- **Student Syllabus Catalog**: Prescribed textbooks grouped by subject with real-time stock pills and cover previews.
- **Digital Library ID Card**: Student credential pass with high-contrast QR code for desk scanning.
- **Circulation Desk QR Scanner**: Camera viewport scanning student passes and textbook QR labels with automated issue/return detection.
- **Digital Learning Hub & Video Lectures**: In-browser video player with notes, auto-save progress bar, and post-lecture quiz.
- **Library Wrapped**: Colorful visual story card summarizing student learning achievements with image download button.
- **Admin Intelligence Dashboard**: Interactive Recharts analytics covering loan trends, category pie distribution, and weekday circulation.

---

## Step-by-Step Production Deployment Guide

Follow this exact checklist to deploy the backend on **Render**, database on **Neon**, and frontend on **Vercel**.

### Step 1: Create PostgreSQL Database on Neon
1. Log in to [Neon Console](https://console.neon.tech/).
2. Click **Create Project**, name it `smart-library-db`, and select your closest AWS region.
3. Once provisioned, find the **Connection Details** widget on your dashboard.
4. Set the dropdown to **Connection string** (Direct or Pooled) and copy the URL:
   ```text
   postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this `DATABASE_URL` for the Render configuration.

### Step 2: Deploy Django Backend on Render
1. Push your repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Select your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `smart-library-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn config.wsgi:application`
5. Click **Advanced** -> **Add Environment Variable**:
   - `DATABASE_URL`: *(Paste your Neon connection string from Step 1)*
   - `SECRET_KEY`: *(Enter a long random secret string)*
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `localhost,127.0.0.1,.onrender.com`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-app.vercel.app` *(update after Step 3)*
   - `PYTHON_VERSION`: `3.11.0`
6. Click **Create Web Service**. Render will execute `build.sh`, run migrations, generate QR codes, collect static files, and launch Gunicorn.
7. Copy your assigned Render API URL (e.g. `https://smart-library-api.onrender.com`).

### Step 3: Deploy React Frontend on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: *(Paste your Render backend URL from Step 2, e.g. `https://smart-library-api.onrender.com`)*
5. Click **Deploy**. Vercel will bundle the production build and configure SPA routing rewrites via `vercel.json`.
6. Once deployed, copy your production frontend URL (e.g. `https://smart-library-app.vercel.app`).
7. Return to your Render backend settings, update `CORS_ALLOWED_ORIGINS` to match your Vercel URL, and trigger a manual redeploy.

---

## College Viva & Architecture Overview (Hinglish Guide)

Viva mein examiners aksar project architecture, data flow aur design choices ke baare mein poochte hain. Yahan quick revision points diye gaye hain:

### 1. Overall System Architecture
- **Backend**: Django REST Framework (DRF) as a stateless REST API. Database abstraction ke liye Django ORM use kiya gaya hai.
- **Authentication**: JWT (JSON Web Tokens) with SimpleJWT. Access token (1 day validity) frontend ke memory/localStorage mein rehta hai aur Axios interceptor automatically `Authorization: Bearer <token>` header attach karta hai. 401 error aane par refresh token se new access token silently fetch hota hai.
- **Frontend**: React 19 Single Page Application (SPA) with Vite. Routing ke liye `react-router-dom`, component styling ke liye vanilla CSS variables (dark/light mode support), data visualization ke liye `recharts`, camera scanning ke liye `html5-qrcode`, aur card export ke liye `html2canvas` use kiya gaya hai.

### 2. Core Business Logic & Rules
- **Circulation Model (`Issue` & `Reservation`)**:
  - Har student maximum **3 books** borrow kar sakta hai. Loan period **14 days** ka hota hai.
  - Return date cross hone par **Rs 2 per day** fine calculate hota hai (`(today - due_date).days * 2`).
  - Book issue hone par `available_copies` -1 hoti hai; return hone par +1 hoti hai.
  - Jab copies 0 hoti hain, student **Reservation Queue** join kar sakta hai (FIFO based on `created_at`).
  - Jaise hi koi copy return hoti hai, system queue ke first student ko identify karke status **"ready"** mark kar deta hai aur notification trigger karta hai.

### 3. QR Code Workflow
- **Auto-Generation**: `Book` model ke `save()` method par Python library `qrcode` call hoti hai. Har book ke liye unique code jaise `LIB-000001` create hota hai aur uski PNG image `media/book_qrs/` folder mein save hoti hai.
- **Desk Circulation**: Librarian webcam ya phone camera se student card QR scan karta hai, phir book QR scan karta hai. System check karta hai ki kya yeh book pehle se student ko issued hai. Agar haan, toh automatically "Return" screen dikhata hai with fine amount; agar nahi, toh "Issue" screen dikhata hai.

### 4. Gamification & Signals
- Points aur badges automated **Django Signals** (`post_save`) se update hote hain. Example: Jab `Issue` status `returned` hota hai time par, signal student ko +15 points deta hai. Jab `VideoProgress` 100% complete hota hai, +20 points milte hain. Agar points ya streaks threshold cross karte hain, corresponding `Badge` record auto-create ho jata hai.
- **Certificate Generation**: ReportLab library se dynamic PDF canvas generate hota hai jisme student ka verified name, course, aur subject completion watermark print hota hai.
