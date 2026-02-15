import { Routes, Route } from "react-router-dom";
import PublicLayout from "../components/layout/public/PublicLayout";

import Home from "../pages/public/Home";
import Courses from "../pages/public/Courses";
import Enquiry from "../pages/public/Enquiry";
import CourseDetails from "../pages/public/CourseDetails";
import Gallery from "../pages/public/Gallery";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/gallery" element={<Gallery />} />

        <Route path="/enquiry" element={<Enquiry />} />
      </Route>
    </Routes>
  );
}
