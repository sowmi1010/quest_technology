import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import { uploadStudentPhoto } from "../middleware/upload.middleware.js";
import {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", adminProtect, listStudents);
router.post("/", adminProtect, uploadStudentPhoto, createStudent);

router.get("/:id", adminProtect, getStudent);
router.patch("/:id", adminProtect, uploadStudentPhoto, updateStudent);
router.delete("/:id", adminProtect, deleteStudent);

export default router;
