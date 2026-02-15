import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import { uploadCourseImage } from "../middleware/upload.middleware.js";

import {
  createCourse,
  listPublicCourses,
  listAdminCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

const router = express.Router();

// Public
router.get("/public", listPublicCourses);
router.get("/public/:id", getCourse);

// Admin
router.get("/", adminProtect, listAdminCourses);
router.post("/", adminProtect, uploadCourseImage, createCourse);
router.get("/:id", adminProtect, getCourse);
router.patch("/:id", adminProtect, uploadCourseImage, updateCourse);
router.delete("/:id", adminProtect, deleteCourse);

export default router;
