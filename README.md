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
- Auth: JWT + bcrypt
- File uploads: Multer
- Validation: Zod
- PDF: PDFKit + QRCode

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
