import express from "express";
import cors from "cors";
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
import paymentScheduleRoutes from "./routes/paymentSchedule.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";



const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true, message: "API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment-schedule", paymentScheduleRoutes);
app.use("/api/feedback", feedbackRoutes);
// app.use("/api/placements", placementRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
