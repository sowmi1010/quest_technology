import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export async function adminProtect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ ok: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId).select("-passwordHash");
    if (!admin) return res.status(401).json({ ok: false, message: "Invalid token" });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}
