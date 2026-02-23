import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { AUTH_COOKIE_NAMES, getCookieValue } from "../utils/authCookies.js";

function getTokenFromRequest(req) {
  const header = req.headers.authorization || "";
  const headerToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (headerToken) return headerToken;
  return getCookieValue(req, AUTH_COOKIE_NAMES.access);
}

export async function adminProtect(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) return res.status(401).json({ ok: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.tokenType !== "access") {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const admin = await Admin.findById(decoded.adminId).select("-passwordHash");
    if (!admin) return res.status(401).json({ ok: false, message: "Invalid token" });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}
