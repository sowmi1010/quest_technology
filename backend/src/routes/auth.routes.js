import express from "express";
import rateLimit from "express-rate-limit";
import { loginAdmin, registerAdmin, meAdmin } from "../controllers/auth.controller.js";
import { adminProtect } from "../middleware/auth.middleware.js";

const router = express.Router();

function numFromEnv(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const loginLimiter = rateLimit({
  windowMs: numFromEnv("LOGIN_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: numFromEnv("LOGIN_RATE_LIMIT_MAX", 5),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    ok: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// first time only (create admin). later you can remove.
router.post("/register", registerAdmin);

router.post("/login", loginLimiter, loginAdmin);
router.get("/me", adminProtect, meAdmin);

export default router;
