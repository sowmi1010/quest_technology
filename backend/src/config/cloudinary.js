import { v2 as cloudinary } from "cloudinary";

let configured = false;

function readCloudinaryEnv() {
  return {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || "").trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || "").trim(),
  };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();
  return Boolean(cloudName && apiKey && apiSecret);
}

export function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) return false;
  if (configured) return true;

  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
  return true;
}

export default cloudinary;
