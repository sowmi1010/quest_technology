import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/admin/auth/Login";
import ForgotPassword from "../pages/admin/auth/ForgotPassword";
import ResetPassword from "../pages/admin/auth/ResetPassword";
import AdminLayout from "../components/layout/admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Admin pages
import Dashboard from "../pages/admin/dashboard/Dashboard";

import EnquiryList from "../pages/admin/enquiries/EnquiryList";
import EnquiryView from "../pages/admin/enquiries/EnquiryView";

import CourseList from "../pages/admin/courses/CourseList";
import CourseForm from "../pages/admin/courses/CourseForm";

import StudentList from "../pages/admin/students/StudentList";
import StudentForm from "../pages/admin/students/StudentForm";

import CertificateList from "../pages/admin/certificates/CertificateList";
import IssueCertificate from "../pages/admin/certificates/IssueCertificate";

import AttendanceReport from "../pages/admin/attendance/AttendanceReport";

import StudentProfile from "../pages/admin/students/profile/StudentProfile";
import PaymentsOverview from "../pages/admin/payments/PaymentsOverview";

import FeedbackList from "../pages/admin/feedback/FeedbackList";
import FeedbackForm from "../pages/admin/feedback/FeedbackForm";
import GalleryList from "../pages/admin/gallery/GalleryList";
import GalleryForm from "../pages/admin/gallery/GalleryForm";
import MouList from "../pages/admin/mou/MouList";
import MouForm from "../pages/admin/mou/MouForm";

// (Add more later)
// import StudentList from "../pages/admin/students/StudentList";
// import CourseList from "../pages/admin/courses/CourseList";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public admin route */}
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />

      {/* Protected admin area */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="enquiries" element={<EnquiryList />} />
          <Route path="enquiries/:id" element={<EnquiryView />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:id" element={<CourseForm />} />
          <Route path="students" element={<StudentList />} />
          <Route path="payments" element={<PaymentsOverview />} />
          <Route path="students/new" element={<StudentForm />} />
          <Route path="students/:id" element={<StudentForm />} />{" "}
          <Route path="certificates" element={<CertificateList />} />
          <Route path="certificates/issue" element={<IssueCertificate />} />
          <Route path="attendance" element={<Navigate to="/admin/attendance/report" replace />} />
          <Route path="attendance/report" element={<AttendanceReport />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
          <Route path="students/:id/profile" element={<StudentProfile />} />
          <Route path="feedback" element={<FeedbackList />} />
          <Route path="feedback/new" element={<FeedbackForm />} />
          <Route path="feedback/:id" element={<FeedbackForm />} />
          <Route path="gallery" element={<GalleryList />} />
          <Route path="gallery/new" element={<GalleryForm />} />
          <Route path="gallery/:id" element={<GalleryForm />} />
          <Route path="mou" element={<MouList />} />
          <Route path="mou/new" element={<MouForm />} />
          <Route path="mou/:id" element={<MouForm />} />
        </Route>
      </Route>

      {/* Anything wrong redirect to login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
