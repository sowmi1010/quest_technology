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

function buildCloudinaryStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
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

const CLOUDINARY_REQUIRED_MESSAGE =
  "Image upload is disabled because Cloudinary is not configured.";

function createImageUploader({ folder, fieldName, maxFileSize }) {
  const upload =
    isCloudinaryConfigured
      ? multer({
        storage: buildCloudinaryStorage(folder),
        fileFilter,
        limits: { fileSize: maxFileSize },
      }).single(fieldName)
      : null;

  return function imageUploader(req, res, next) {
    if (!upload) {
      return res.status(503).json({
        ok: false,
        message: CLOUDINARY_REQUIRED_MESSAGE,
      });
    }

    return upload(req, res, next);
  };
}

export const uploadCourseImage = createImageUploader({
  folder: "courses",
  fieldName: "image",
  maxFileSize: 2 * 1024 * 1024,
});

export const uploadStudentPhoto = createImageUploader({
  folder: "students",
  fieldName: "photo",
  maxFileSize: 2 * 1024 * 1024,
});

export const uploadFeedbackImage = createImageUploader({
  folder: "feedback",
  fieldName: "image",
  maxFileSize: 2 * 1024 * 1024,
});

export const uploadGalleryImage = createImageUploader({
  folder: "gallery",
  fieldName: "image",
  maxFileSize: 4 * 1024 * 1024,
});
