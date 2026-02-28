import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { ensureCloudinaryConfigured } from "../config/cloudinary.js";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
]);

const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "avif"];

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
        allowed_formats: ALLOWED_IMAGE_FORMATS,
        public_id: `${sanitizeName(originalBase)}-${Date.now()}`,
      };
    },
  });
}

function fileFilter(req, file, cb) {
  const mime = String(file?.mimetype || "").toLowerCase();
  const ok = ALLOWED_IMAGE_MIME_TYPES.has(mime);
  cb(ok ? null : new Error("Only JPG/JPEG/PNG/WEBP/HEIC/HEIF/AVIF allowed"), ok);
}

function getUploadErrorResponse(err, maxFileSize) {
  if (!err) return null;

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxMb = Math.max(1, Math.round(maxFileSize / (1024 * 1024)));
      return {
        status: 413,
        message: `Image too large. Max size is ${maxMb}MB.`,
      };
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return { status: 400, message: "Unexpected file field in upload request." };
    }

    return { status: 400, message: err.message || "Invalid upload request." };
  }

  const message = String(err.message || "Image upload failed");
  if (
    /only .*allowed/i.test(message) ||
    /invalid image/i.test(message) ||
    /unsupported/i.test(message)
  ) {
    return { status: 400, message };
  }

  if (/cloudinary|api key|authentication|timeout|network/i.test(message)) {
    return { status: 503, message: "Image upload service unavailable. Please try again." };
  }

  return { status: 500, message };
}

const CLOUDINARY_REQUIRED_MESSAGE =
  "Image upload is disabled because Cloudinary is not configured.";

function createImageUploader({ folder, fieldName, maxFileSize }) {
  let upload = null;

  return function imageUploader(req, res, next) {
    if (!upload && ensureCloudinaryConfigured()) {
      upload = multer({
        storage: buildCloudinaryStorage(folder),
        fileFilter,
        limits: { fileSize: maxFileSize },
      }).single(fieldName);
    }

    if (!upload) {
      return res.status(503).json({
        ok: false,
        message: CLOUDINARY_REQUIRED_MESSAGE,
      });
    }

    return upload(req, res, (err) => {
      if (!err) return next();

      const { status, message } = getUploadErrorResponse(err, maxFileSize);
      return res.status(status).json({
        ok: false,
        message,
      });
    });
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
  maxFileSize: 5 * 1024 * 1024,
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

export const uploadMouImage = createImageUploader({
  folder: "mou",
  fieldName: "image",
  maxFileSize: 4 * 1024 * 1024,
});
