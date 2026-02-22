import path from "path";
import fs from "fs";
import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCertNo } from "../utils/certNo.js";
import { generateCertificatePDF } from "../utils/certificatePdf.js";
import { getNextCertificateSerial } from "../utils/certificateNoSequence.js";

const PUBLIC_APP_URL = String(process.env.PUBLIC_APP_URL || "http://localhost:5173").replace(/\/+$/, "");

function isCertNoDuplicateError(err) {
  return (
    err?.code === 11000 &&
    (err?.keyPattern?.certNo || err?.keyValue?.certNo)
  );
}

export const issueCertificate = asyncHandler(async (req, res) => {
  const {
    studentId,
    courseId,
    startDate,
    endDate,
    issueDate,
    performance,
    remarks,
  } = req.body;

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ ok: false, message: "Course not found" });

  const studentPhotoSource = String(student.photoUrl || "");

  // Retry if certNo hits a unique-key conflict due legacy/manual rows.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const seq = await getNextCertificateSerial();
    const certNo = generateCertNo(seq);

    const filename = `${certNo}.pdf`;
    const pdfUrl = `/uploads/certificates/${filename}`;
    const outPath = path.join(process.cwd(), "uploads", "certificates", filename);
    const verifyUrl = `${PUBLIC_APP_URL}/verify/${certNo}`;

    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    let cert = null;
    try {
      // Reserve certNo first to avoid file overwrite race on duplicate certNo.
      cert = await Certificate.create({
        certNo,
        studentId: student._id,
        courseId: course._id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        performance: performance || "",
        remarks: remarks || "",
        pdfUrl,
      });

      await generateCertificatePDF({
        outPath,
        certNo,
        verifyUrl,
        studentName: student.name,
        studentPhotoSource,
        courseTitle: course.title,
        startDate,
        endDate,
        issueDate: issueDate || new Date(),
        performance,
        remarks,
      });

      return res.status(201).json({ ok: true, message: "Certificate generated", data: cert });
    } catch (err) {
      if (isCertNoDuplicateError(err) && attempt < 2) {
        continue;
      }

      if (fs.existsSync(outPath)) {
        try {
          fs.unlinkSync(outPath);
        } catch {
          // Ignore cleanup errors.
        }
      }

      // Rollback reserved DB row if PDF generation failed after create.
      if (cert?._id) {
        await Certificate.findByIdAndDelete(cert._id);
      }
      throw err;
    }
  }
});

export const listCertificates = asyncHandler(async (req, res) => {
  const list = await Certificate.find()
    .populate("studentId", "name studentId photoUrl")
    .populate("courseId", "title")
    .sort({ createdAt: -1 });

  res.json({ ok: true, data: list });
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certNo: req.params.certNo })
    .populate("studentId", "name studentId photoUrl")
    .populate("courseId", "title duration");

  if (!cert) return res.status(404).json({ ok: false, message: "Invalid certificate" });

  res.json({ ok: true, data: cert });
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id);
  if (!cert) return res.status(404).json({ ok: false, message: "Certificate not found" });

  if (cert.pdfUrl) {
    const relativePath = String(cert.pdfUrl).replace(/^\/+/, "");
    const absPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(absPath)) {
      try {
        fs.unlinkSync(absPath);
      } catch {
        // Ignore filesystem delete errors and continue db cleanup.
      }
    }
  }

  await Certificate.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: "Certificate deleted" });
});
