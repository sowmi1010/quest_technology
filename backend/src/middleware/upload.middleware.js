import multer from "multer";
import path from "path";

function makeStorage(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, folder),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = file.originalname.replace(ext, "").replace(/\s+/g, "-").toLowerCase();
      cb(null, `${name}-${Date.now()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only JPG/PNG/WEBP allowed"), ok);
}

export const uploadCourseImage = multer({
  storage: makeStorage("uploads/courses"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");

export const uploadStudentPhoto = multer({
  storage: makeStorage("uploads/students"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("photo");

/* ✅ ADD THIS EXPORT */
export const uploadFeedbackImage = multer({
  storage: makeStorage("uploads/feedback"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");
