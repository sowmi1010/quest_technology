import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load backend/.env even if the process is started from another cwd.
dotenv.config({ path: path.resolve(__dirname, ".env") });

const PORT = process.env.PORT || 3000;
const MIN_NODE_MAJOR = 18;
const WEAK_JWT_SECRET_VALUES = new Set([
  "quest_secret_change_this",
  "change_this",
  "default",
  "jwt_secret",
  "your_jwt_secret",
  "replace-with-a-long-random-secret",
]);

function validateRuntimeSupport() {
  const nodeVersion = String(process.versions?.node || "").trim();
  const major = Number(nodeVersion.split(".")[0] || 0);

  if (!Number.isFinite(major) || major < MIN_NODE_MAJOR) {
    throw new Error(
      `Unsupported Node.js version ${nodeVersion || "unknown"}. Use Node.js >= ${MIN_NODE_MAJOR}.`
    );
  }

  if (typeof fetch !== "function") {
    throw new Error("Global fetch API is unavailable. Use Node.js >= 18.");
  }
}

function validateSecurityConfig() {
  const jwtSecret = String(process.env.JWT_SECRET || "");
  const normalized = jwtSecret.trim().toLowerCase();

  if (!jwtSecret || jwtSecret.length < 32 || WEAK_JWT_SECRET_VALUES.has(normalized)) {
    throw new Error("Invalid JWT_SECRET. Use a strong random value of at least 32 characters.");
  }
}

async function start() {
  validateRuntimeSupport();
  validateSecurityConfig();

  // Load modules after env is initialized so middleware sees Cloudinary vars.
  const [{ default: app }, { connectDB }] = await Promise.all([
    import("./src/app.js"),
    import("./src/config/db.js"),
  ]);

  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Server failed:", err.message);
  process.exit(1);
});
