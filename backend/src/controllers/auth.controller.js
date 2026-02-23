import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AUTH_COOKIE_NAMES, clearAuthCookies, getCookieValue, setAuthCookies } from "../utils/authCookies.js";

const ACCESS_TOKEN_TTL = String(process.env.ACCESS_TOKEN_TTL || "15m");
const REFRESH_TOKEN_TTL = String(process.env.REFRESH_TOKEN_TTL || "7d");

const signAccessToken = (adminId) =>
  jwt.sign({ adminId, tokenType: "access" }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (adminId) =>
  jwt.sign({ adminId, tokenType: "refresh" }, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

function issueAuthCookies(res, adminId) {
  setAuthCookies(res, {
    accessToken: signAccessToken(adminId),
    refreshToken: signRefreshToken(adminId),
  });
}

function envFlagEnabled(name, fallback = false) {
  const raw = String(process.env[name] || "").trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function isLocalOrPrivateIp(ipValue) {
  const normalized = String(ipValue || "").trim().replace(/^::ffff:/, "").toLowerCase();
  if (!normalized) return false;

  if (normalized === "::1" || normalized === "127.0.0.1") return true;
  if (normalized.startsWith("10.")) return true;
  if (normalized.startsWith("192.168.")) return true;
  if (normalized.startsWith("172.")) {
    const secondOctet = Number(normalized.split(".")[1]);
    if (Number.isInteger(secondOctet) && secondOctet >= 16 && secondOctet <= 31) return true;
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;

  return false;
}

function isTrustedRegistrationSource(req) {
  const addresses = [req.ip, req.socket?.remoteAddress];
  return addresses.some((address) => isLocalOrPrivateIp(address));
}

function getProvidedSetupKey(req) {
  const headerKey = req.get("x-admin-setup-key");
  const bodyKey = req.body?.setupKey;
  return String(headerKey || bodyKey || "").trim();
}

export const registerAdmin = asyncHandler(async (req, res) => {
  // Registration is open for first-admin bootstrap only.
  // Once bootstrap is done, route is hidden unless explicitly re-enabled.
  const hasAdmin = await Admin.exists({});
  if (hasAdmin) {
    const registrationEnabled = envFlagEnabled("ENABLE_ADMIN_REGISTRATION", false);
    if (!registrationEnabled) {
      return res.status(404).json({ ok: false, message: "Not Found" });
    }

    const localOnly = envFlagEnabled("ADMIN_REGISTRATION_LOCAL_ONLY", true);
    if (localOnly && !isTrustedRegistrationSource(req)) {
      return res.status(403).json({
        ok: false,
        message: "Admin registration allowed only from localhost or private network",
      });
    }

    const setupKey = String(process.env.ADMIN_SETUP_KEY || "").trim();
    const providedKey = getProvidedSetupKey(req);

    if (!setupKey) {
      return res.status(403).json({
        ok: false,
        message: "ADMIN_SETUP_KEY is required when registration is re-enabled",
      });
    }

    if (providedKey !== setupKey) {
      return res.status(403).json({ ok: false, message: "Invalid admin setup key" });
    }
  }

  // (Use only for first time, later you can disable this route)
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  });

  const { name, email, password } = schema.parse(req.body);

  const exist = await Admin.findOne({ email });
  if (exist) return res.status(400).json({ ok: false, message: "Admin already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await Admin.create({ name, email, passwordHash });

  res.json({
    ok: true,
    message: "Admin created",
    data: { id: admin._id, email: admin.email },
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const { email, password } = schema.parse(req.body);

  const admin = await Admin.findOne({ email });
  if (!admin || !admin.isActive)
    return res.status(401).json({ ok: false, message: "Invalid credentials" });

  const ok = await admin.comparePassword(password);
  if (!ok) return res.status(401).json({ ok: false, message: "Invalid credentials" });

  issueAuthCookies(res, admin._id);

  res.json({
    ok: true,
    message: "Login success",
    data: {
      admin: { id: admin._id, name: admin.name, email: admin.email },
    },
  });
});

export const refreshAdminSession = asyncHandler(async (req, res) => {
  const refreshToken = getCookieValue(req, AUTH_COOKIE_NAMES.refresh);
  if (!refreshToken) {
    return res.status(401).json({ ok: false, message: "No refresh token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ ok: false, message: "Invalid refresh token" });
  }

  if (decoded?.tokenType !== "refresh") {
    return res.status(401).json({ ok: false, message: "Invalid refresh token" });
  }

  const admin = await Admin.findById(decoded.adminId).select("-passwordHash");
  if (!admin || !admin.isActive) {
    return res.status(401).json({ ok: false, message: "Invalid refresh token" });
  }

  issueAuthCookies(res, admin._id);

  res.json({
    ok: true,
    message: "Session refreshed",
    data: { id: admin._id, name: admin.name, email: admin.email },
  });
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true, message: "Logout success" });
});

export const meAdmin = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: req.admin });
});
