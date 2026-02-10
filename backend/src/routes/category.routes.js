import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import {
  createCategory,
  listAdminCategories,
  listPublicCategories,
} from "../controllers/category.controller.js";

const router = express.Router();

// Public
router.get("/public", listPublicCategories);

// Admin
router.get("/", adminProtect, listAdminCategories);
router.post("/", adminProtect, createCategory);

export default router;
