import path from "path";
import fs from "fs";
import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCertNo } from "../utils/certNo.js";
import { generateCertificatePDF } from "../utils/certificatePdf.js";
import { getNextCertificateSerial } from "../utils/certificateNoSequence.js";
import { parseOptionalIsoDateInput } from "../utils/dateValidation.js";
import {
  buildPagination,
  escapeRegex,
  parsePaginationParams,
  parseSortToken,
} from "../utils/listQuery.js";

const CERTIFICATE_UPLOAD_PREFIX = "/uploads/certificates/";
const CERTIFICATE_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "certificates"
);

function resolvePublicAppUrl() {
  const configured = String(process.env.PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
  if (configured) return configured;

  const isProd = String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";
  if (isProd) {
    throw new Error("PUBLIC_APP_URL is required in production.");
  }

  return "http://localhost:5173";
}

const PUBLIC_APP_URL = resolvePublicAppUrl();

function resolveSafeCertificatePdfPath(pdfUrl) {
  const normalizedUrl = String(pdfUrl || "").trim();
  if (!normalizedUrl.startsWith(CERTIFICATE_UPLOAD_PREFIX)) return null;

  const relativePath = normalizedUrl.replace(/^\/+/, "");
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const relativeToUploadDir = path.relative(CERTIFICATE_UPLOAD_DIR, absolutePath);

  if (
    relativeToUploadDir.startsWith("..") ||
    path.isAbsolute(relativeToUploadDir)
  ) {
    return null;
  }

  return absolutePath;
}

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

  const parsedStartDate = parseOptionalIsoDateInput(startDate, "startDate");
  if (!parsedStartDate.ok) {
    return res.status(400).json({ ok: false, message: parsedStartDate.message });
  }

  const parsedEndDate = parseOptionalIsoDateInput(endDate, "endDate");
  if (!parsedEndDate.ok) {
    return res.status(400).json({ ok: false, message: parsedEndDate.message });
  }

  const parsedIssueDate = parseOptionalIsoDateInput(issueDate, "issueDate");
  if (!parsedIssueDate.ok) {
    return res.status(400).json({ ok: false, message: parsedIssueDate.message });
  }

  const normalizedStartDate = parsedStartDate.provided ? parsedStartDate.value : null;
  const normalizedEndDate = parsedEndDate.provided ? parsedEndDate.value : null;
  const normalizedIssueDate = parsedIssueDate.provided
    ? parsedIssueDate.value
    : new Date();

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
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        issueDate: normalizedIssueDate,
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
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        issueDate: normalizedIssueDate,
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
  const { page, limit, skip } = parsePaginationParams(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const keyword = String(req.query.keyword || "").trim();
  const sort = parseSortToken(
    req.query.sort,
    {
      newest: { issueDate: -1, createdAt: -1, _id: -1 },
      oldest: { issueDate: 1, createdAt: 1, _id: 1 },
      "issueDate:desc": { issueDate: -1, createdAt: -1, _id: -1 },
      "issueDate:asc": { issueDate: 1, createdAt: 1, _id: 1 },
      "createdAt:desc": { createdAt: -1, _id: -1 },
      "createdAt:asc": { createdAt: 1, _id: 1 },
      "certNo:asc": { certNo: 1, _id: -1 },
      "certNo:desc": { certNo: -1, _id: -1 },
    },
    "issueDate:desc"
  );

  const pipeline = [
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: {
        path: "$course",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (keyword) {
    const keywordRegex = new RegExp(escapeRegex(keyword), "i");
    pipeline.push({
      $match: {
        $or: [
          { certNo: keywordRegex },
          { "student.name": keywordRegex },
          { "student.studentId": keywordRegex },
          { "course.title": keywordRegex },
          { performance: keywordRegex },
          { remarks: keywordRegex },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            certNo: 1,
            startDate: 1,
            endDate: 1,
            issueDate: 1,
            performance: 1,
            remarks: 1,
            pdfUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            studentId: {
              _id: "$student._id",
              name: "$student.name",
              studentId: "$student.studentId",
              photoUrl: "$student.photoUrl",
            },
            courseId: {
              _id: "$course._id",
              title: "$course.title",
            },
          },
        },
      ],
      totalMeta: [{ $count: "total" }],
    },
  });

  const [result] = await Certificate.aggregate(pipeline);
  const data = Array.isArray(result?.data) ? result.data : [];
  const total = Number(result?.totalMeta?.[0]?.total || 0);

  res.json({
    ok: true,
    data,
    pagination: buildPagination(total, page, limit),
    summary: {
      total,
    },
  });
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
    const absPath = resolveSafeCertificatePdfPath(cert.pdfUrl);

    if (absPath && fs.existsSync(absPath)) {
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
