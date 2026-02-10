import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import { uploadFeedbackImage } from "../middleware/upload.middleware.js";
import {
  createFeedback,
  listFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackById,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// ✅ public testimonials
router.get("/public", listFeedback);

// ✅ admin
router.get("/", adminProtect, listFeedback);
router.get("/:id", adminProtect, getFeedbackById);

router.post("/", adminProtect, uploadFeedbackImage, createFeedback);
router.patch("/:id", adminProtect, uploadFeedbackImage, updateFeedback);

router.delete("/:id", adminProtect, deleteFeedback);

export default router;
