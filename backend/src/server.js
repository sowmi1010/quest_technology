import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;
const WEAK_JWT_SECRET_VALUES = new Set([
  "quest_secret_change_this",
  "change_this",
  "default",
  "jwt_secret",
  "your_jwt_secret",
  "replace-with-a-long-random-secret",
]);

function validateSecurityConfig() {
  const jwtSecret = String(process.env.JWT_SECRET || "");
  const normalized = jwtSecret.trim().toLowerCase();

  if (!jwtSecret || jwtSecret.length < 32 || WEAK_JWT_SECRET_VALUES.has(normalized)) {
    throw new Error("Invalid JWT_SECRET. Use a strong random value of at least 32 characters.");
  }
}

async function start() {
  validateSecurityConfig();
  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Server failed:", err.message);
  process.exit(1);
});
