import express from "express";
import rateLimit from "express-rate-limit";
import {
  changeAdminPassword,
  forgotAdminPassword,
  loginAdmin,
  logoutAdmin,
  meAdmin,
  resetAdminPassword,
  refreshAdminSession,
  registerAdmin,
} from "../controllers/auth.controller.js";
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

const forgotPasswordLimiter = rateLimit({
  windowMs: numFromEnv("FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: numFromEnv("FORGOT_PASSWORD_RATE_LIMIT_MAX", 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Too many reset attempts. Please try again later.",
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: numFromEnv("RESET_PASSWORD_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: numFromEnv("RESET_PASSWORD_RATE_LIMIT_MAX", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Too many reset attempts. Please try again later.",
  },
});

// first time only (create admin). later you can remove.
router.post("/register", registerAdmin);

router.post("/login", loginLimiter, loginAdmin);
router.post("/forgot-password", forgotPasswordLimiter, forgotAdminPassword);
router.post("/reset-password", resetPasswordLimiter, resetAdminPassword);
router.post("/refresh", refreshAdminSession);
router.post("/logout", logoutAdmin);
router.post("/change-password", adminProtect, changeAdminPassword);
router.get("/me", adminProtect, meAdmin);

export default router;
