import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

function sanitizeName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const mimeToExt = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
let warnedCloudinaryFallback = false;

function resolveLocalUploadDir(folder) {
  const dir = path.join(uploadsRoot, folder);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getSafeExtension(file) {
  const fromMime = mimeToExt[file.mimetype];
  if (fromMime) return fromMime;

  const extFromName = path.extname(String(file.originalname || "")).replace(".", "").toLowerCase();
  if (["jpg", "jpeg", "png", "webp"].includes(extFromName)) {
    return extFromName === "jpeg" ? "jpg" : extFromName;
  }

  return "jpg";
}

function buildLocalStorage(folder) {
  const destinationDir = resolveLocalUploadDir(folder);

  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, destinationDir);
    },
    filename(req, file, cb) {
      const originalBase = file.originalname?.replace(/\.[^/.]+$/, "") || "file";
      const ext = getSafeExtension(file);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${sanitizeName(originalBase)}-${unique}.${ext}`);
    },
  });
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

function buildStorage(folder) {
  if (isCloudinaryConfigured) {
    return buildCloudinaryStorage(folder);
  }

  if (!warnedCloudinaryFallback) {
    warnedCloudinaryFallback = true;
    console.warn("Cloudinary is not configured. Falling back to local disk uploads under /uploads.");
  }

  return buildLocalStorage(folder);
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
