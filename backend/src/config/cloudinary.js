import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const API_KEY = String(process.env.CLOUDINARY_API_KEY || "").trim();
const API_SECRET = String(process.env.CLOUDINARY_API_SECRET || "").trim();

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export default cloudinary;
