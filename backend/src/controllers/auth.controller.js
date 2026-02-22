import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (adminId) =>
  jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: "7d" });

function getProvidedSetupKey(req) {
  const headerKey = req.get("x-admin-setup-key");
  const bodyKey = req.body?.setupKey;
  return String(headerKey || bodyKey || "").trim();
}

export const registerAdmin = asyncHandler(async (req, res) => {
  // Registration is open only for first admin bootstrap.
  // After at least one admin exists, require ADMIN_SETUP_KEY.
  const hasAdmin = await Admin.exists({});
  if (hasAdmin) {
    const setupKey = String(process.env.ADMIN_SETUP_KEY || "").trim();
    const providedKey = getProvidedSetupKey(req);

    if (!setupKey) {
      return res.status(403).json({
        ok: false,
        message: "Admin registration is disabled after initial setup",
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

  const token = signToken(admin._id);

  res.json({
    ok: true,
    message: "Login success",
    data: {
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    },
  });
});

export const meAdmin = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: req.admin });
});
