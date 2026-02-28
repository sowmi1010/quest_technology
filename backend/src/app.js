import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import certificateRoutes from "./routes/certificate.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import mouRoutes from "./routes/mou.routes.js";
import performanceRoutes from "./routes/performance.routes.js";

function stripWrappingQuotes(value = "") {
  return String(value || "").trim().replace(/^['"`]+|['"`]+$/g, "");
}

function normalizeOrigin(value = "") {
  const raw = stripWrappingQuotes(value);
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

function isTrustedQuestVercelOrigin(origin = "") {
  const normalized = normalizeOrigin(origin);
  return /^https:\/\/quest-technology(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(normalized);
}

function getAllowedOrigins() {
  const envList = String(process.env.CORS_ORIGINS || "")
    .split(/[\n,]+/)
    .map((v) => stripWrappingQuotes(v))
    .filter(Boolean);

  const configured = [
    ...envList,
    stripWrappingQuotes(process.env.PUBLIC_APP_URL),
  ]
    .map(normalizeOrigin)
    .filter(Boolean);

  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://quest-technology.vercel.app",
  ];

  return [...new Set([...defaults, ...configured])];
}

const app = express();
const allowedOrigins = getAllowedOrigins();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(hpp());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl/Postman) that do not send Origin.
      if (!origin) return callback(null, true);

      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized) || isTrustedQuestVercelOrigin(normalized)) {
        return callback(null, true);
      }

      const err = new Error(`CORS blocked for origin: ${origin}`);
      err.status = 403;
      return callback(err);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Setup-Key"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, message: "API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/mou", mouRoutes);
app.use("/api/performance", performanceRoutes);
// app.use("/api/placements", placementRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
