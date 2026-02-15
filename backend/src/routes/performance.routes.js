import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import {
  createPerformanceUpdate,
  deletePerformanceUpdate,
  listStudentPerformanceUpdates,
  updatePerformanceUpdate,
} from "../controllers/performance.controller.js";

const router = express.Router();

router.post("/", adminProtect, createPerformanceUpdate);
router.get("/student/:studentId", adminProtect, listStudentPerformanceUpdates);
router.patch("/:id", adminProtect, updatePerformanceUpdate);
router.delete("/:id", adminProtect, deletePerformanceUpdate);

export default router;
