import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

function sanitizeName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}

function buildStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      if (!isCloudinaryConfigured) {
        throw new Error("Cloudinary is not configured. Check CLOUDINARY_* env values.");
      }

      const [type] = String(file.mimetype || "").split("/");
      if (type !== "image") {
        throw new Error("Only image uploads are supported");
      }

      const originalBase = file.originalname?.replace(/\.[^/.]+$/, "") || "file";

      return {
        folder: `quest-technology/${folder}`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: `${sanitizeName(originalBase)}-${Date.now()}`,
      };
    },
  });
}

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only JPG/PNG/WEBP allowed"), ok);
}

export const uploadCourseImage = multer({
  storage: buildStorage("courses"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");

export const uploadStudentPhoto = multer({
  storage: buildStorage("students"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("photo");

export const uploadFeedbackImage = multer({
  storage: buildStorage("feedback"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");

export const uploadGalleryImage = multer({
  storage: buildStorage("gallery"),
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
}).single("image");
