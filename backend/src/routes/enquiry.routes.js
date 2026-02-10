import express from "express";
import {
  createEnquiry,
  listEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "../controllers/enquiry.controller.js";
import { adminProtect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/", createEnquiry);

// Admin protected
router.get("/", adminProtect, listEnquiries);
router.get("/:id", adminProtect, getEnquiryById);
router.patch("/:id", adminProtect, updateEnquiryStatus);

export default router;
