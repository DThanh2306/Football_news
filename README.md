# Football News Website

## Overview
This project is a football news website built with **Node.js**, **Express**, **PostgreSQL**, and **Vue.js**.  
The system provides real-time football updates, news management, post scheduling, admin dashboards, and a modern responsive UI.

## Features
### User Side
- View latest football news.
- Real-time match data.
- Categorized news (Leagues, Clubs, Players, Transfers, etc.).
- Search with auto-suggestions.
- Share and copy link functionality.
- SEO-friendly URLs and dynamic metadata.
- Responsive UI using Vue.js.

### Admin Side
- Post management (CRUD).
- Categories & tags management.
- Upload images (thumbnail, banner, content images).
- Rich text editor for post content.
- Post source URL handling.
- Preview before publishing.
- Role & permission.
- Admin dashboard.

### Backend / API
- RESTful endpoints for posts, categories, matches...
- JWT-based authentication.
- Reusable services and repositories.
- Error handling middleware.
- Pagination, filtering, sorting.

## Tech Stack
### Frontend
- Vue.js 3
- Pinia
- Vue Router
- TailwindCSS / Ant Design Vue

### Backend
- Node.js + Express
- PostgreSQL + pg
- JWT Auth
- Multer for uploads

## Project Structure
```
Football_news/
│── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── config/
│   └── server.js
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── stores/
│   │   └── api/
│   └── index.html
│
└── README.md
```

## Installation

### 1. Clone Repository
```
git clone https://github.com/your-repo/Football_news.git
cd Football_news
```

---

## Backend Setup
```
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

### Environment Variables
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=football_news
JWT_SECRET=secretkey
```

---

## Frontend Setup
```
cd frontend
npm install
npm run dev
```

---

## Build for Production
### Backend
```
npm run start
```

### Frontend
```
npm run build
```

Deploy `dist/` via Nginx.

---

## API Routes (Sample)
```
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
```

---