# Quest Technology (MERN Project)

A full-stack MERN application for managing a training institute, with a public website and a secured admin panel.

## Features

- Public pages: Home, Courses, Course Details, Gallery, Enquiry
- Admin authentication with JWT
- Category and Course management
- Student management with photo upload
- Attendance management and reports
- Payment tracking and overview
- Certificate generation (PDF) and verification
- Enquiry management
- Feedback management with image upload
- Gallery management with image upload

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Runtime: Node.js 18+ required for backend
- Auth: JWT + bcrypt
- File uploads: Multer
- Validation: Zod
- Certificate render: Puppeteer (HTML to PDF + PNG) + QRCode

## Project Structure

```text
quest-technology/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── uploads/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    └── public/

## Environment Variables

1. Copy `backend/.env.example` to `backend/.env`.
2. Fill real values in `backend/.env`.
3. Never commit `.env` files to git.
4. Keep `ENABLE_ADMIN_REGISTRATION=false` after first admin setup.
5. If temporary re-enable is needed, keep `ADMIN_REGISTRATION_LOCAL_ONLY=true` and require `ADMIN_SETUP_KEY`.
6. `CLOUDINARY_*` is optional in local/dev; when missing, uploads (including certificate PDFs/images) are stored in `backend/uploads` and served from `/uploads`.
7. Certificate generation uses Puppeteer. If your host needs a custom browser binary path, set `PUPPETEER_EXECUTABLE_PATH` (and optionally `PUPPETEER_ARGS`).
8. Admin auth now uses `HttpOnly` cookies (`ACCESS_COOKIE_NAME`, `REFRESH_COOKIE_NAME`) instead of storing JWT tokens in browser localStorage.
9. If frontend and backend run on different sites in production, use `AUTH_COOKIE_SAME_SITE=none` and `AUTH_COOKIE_SECURE=true`.

## If Secrets Were Exposed

Rotate these credentials immediately:

1. MongoDB password (`MONGO_URI`)
2. Cloudinary API secret (`CLOUDINARY_API_SECRET`)
3. Gmail app password (`EMAIL_PASS`)
4. JWT secret (`JWT_SECRET`)
