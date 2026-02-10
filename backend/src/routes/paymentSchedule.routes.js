import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import {
  generateScheduleForStudent,
  getStudentSchedule,
  markInstallmentPaid,
} from "../controllers/paymentSchedule.controller.js";

const router = express.Router();

// student schedule
router.post("/student/:studentId/generate", adminProtect, generateScheduleForStudent);
router.get("/student/:studentId", adminProtect, getStudentSchedule);

// mark paid
router.post("/:id/pay", adminProtect, markInstallmentPaid);

export default router;
