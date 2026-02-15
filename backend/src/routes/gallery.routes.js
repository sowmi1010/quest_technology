import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import { uploadGalleryImage } from "../middleware/upload.middleware.js";
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItem,
  listAdminGalleryItems,
  listPublicGalleryItems,
  updateGalleryItem,
} from "../controllers/gallery.controller.js";

const router = express.Router();

router.get("/public", listPublicGalleryItems);

router.get("/", adminProtect, listAdminGalleryItems);
router.get("/:id", adminProtect, getGalleryItem);
router.post("/", adminProtect, uploadGalleryImage, createGalleryItem);
router.patch("/:id", adminProtect, uploadGalleryImage, updateGalleryItem);
router.delete("/:id", adminProtect, deleteGalleryItem);

export default router;
