import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";

import {
  getStudentsByBatch,
  saveAttendance,
  getAttendanceByDate,
} from "../controllers/attendance.controller.js";

import { attendanceReport } from "../controllers/attendanceReport.controller.js";
import {
  getStudentAttendanceRange,
  setStudentAttendanceByDate,
} from "../controllers/attendanceStudent.controller.js";


const router = express.Router();

router.get("/students", adminProtect, getStudentsByBatch);
router.get("/", adminProtect, getAttendanceByDate);
router.post("/", adminProtect, saveAttendance);
router.get("/report", adminProtect, attendanceReport);
router.get("/student/:studentId", adminProtect, getStudentAttendanceRange);
router.patch("/student/:studentId", adminProtect, setStudentAttendanceByDate);



export default router;
