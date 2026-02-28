import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import { uploadMouImage } from "../middleware/upload.middleware.js";
import {
  createMouItem,
  deleteMouItem,
  getMouItem,
  listAdminMouItems,
  listPublicMouItems,
  updateMouItem,
} from "../controllers/mou.controller.js";

const router = express.Router();

router.get("/public", listPublicMouItems);

router.get("/", adminProtect, listAdminMouItems);
router.get("/:id", adminProtect, getMouItem);
router.post("/", adminProtect, uploadMouImage, createMouItem);
router.patch("/:id", adminProtect, uploadMouImage, updateMouItem);
router.delete("/:id", adminProtect, deleteMouItem);

export default router;
