import path from "path";
import fs from "fs";
import os from "os";
import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCertNo } from "../utils/certNo.js";
import { generateCertificateAssets } from "../utils/certificateRender.js";
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
const CERTIFICATE_TEMP_DIR = path.resolve(
  os.tmpdir(),
  "quest-technology",
  "certificates"
);
const CERTIFICATE_CLOUDINARY_PREFIX = "quest-technology/certificates";
const CERTIFICATE_CLOUDINARY_PREVIEW_PREFIX = "quest-technology/certificate-previews";
let warnedCloudinaryFallback = false;

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

function removeFileIfExists(filePath) {
  if (!filePath) return;
  if (!fs.existsSync(filePath)) return;

  try {
    fs.unlinkSync(filePath);
  } catch {
    // Ignore cleanup errors.
  }
}

function resolveCertificateOutPath(filename) {
  if (isCloudinaryConfigured) {
    return path.join(CERTIFICATE_TEMP_DIR, filename);
  }
  return path.join(CERTIFICATE_UPLOAD_DIR, filename);
}

function buildCloudinaryCertificatePublicId(certNo) {
  return `${CERTIFICATE_CLOUDINARY_PREFIX}/${certNo}`;
}

function buildCloudinaryCertificatePreviewPublicId(certNo) {
  return `${CERTIFICATE_CLOUDINARY_PREVIEW_PREFIX}/${certNo}`;
}

function isProdEnv() {
  return String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";
}

function maybeWarnCertificateLocalFallback() {
  if (isCloudinaryConfigured || warnedCloudinaryFallback) return;
  warnedCloudinaryFallback = true;

  const envNote = isProdEnv() ? "production" : "development";
  console.warn(
    `Cloudinary is not configured. Certificate PDFs will be stored on local /uploads in ${envNote}.`
  );
}

async function uploadCertificatePdfToCloudinary({ outPath, certNo }) {
  const publicId = buildCloudinaryCertificatePublicId(certNo);
  const uploaded = await cloudinary.uploader.upload(outPath, {
    resource_type: "raw",
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    unique_filename: false,
    use_filename: false,
  });

  const secureUrl = String(uploaded?.secure_url || uploaded?.url || "").trim();
  if (!secureUrl) {
    throw new Error("Certificate upload failed: Cloudinary did not return a URL.");
  }

  return { publicId, secureUrl };
}

async function uploadCertificatePreviewImageToCloudinary({ outPath, certNo }) {
  const publicId = buildCloudinaryCertificatePreviewPublicId(certNo);
  const uploaded = await cloudinary.uploader.upload(outPath, {
    resource_type: "image",
    public_id: publicId,
    format: "jpg",
    overwrite: true,
    invalidate: true,
    unique_filename: false,
    use_filename: false,
  });

  const secureUrl = String(uploaded?.secure_url || uploaded?.url || "").trim();
  if (!secureUrl) {
    throw new Error("Preview upload failed: Cloudinary did not return a URL.");
  }

  return { publicId, secureUrl };
}

async function deleteCertificatePdfFromCloudinary(certNo) {
  if (!isCloudinaryConfigured || !certNo) return;

  const publicId = buildCloudinaryCertificatePublicId(certNo);
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch {
    // Ignore remote delete errors and continue DB cleanup.
  }
}

async function deleteCertificatePreviewImageFromCloudinary(certNo) {
  if (!isCloudinaryConfigured || !certNo) return;

  const publicId = buildCloudinaryCertificatePreviewPublicId(certNo);
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch {
    // Ignore remote delete errors and continue DB cleanup.
  }
}

function resolveSafeCertificateAssetPath(fileUrl) {
  const normalizedUrl = String(fileUrl || "").trim();
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
  maybeWarnCertificateLocalFallback();

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

    const pdfFilename = `${certNo}.pdf`;
    const imageFilename = `${certNo}.png`;
    const fallbackPdfUrl = `${CERTIFICATE_UPLOAD_PREFIX}${pdfFilename}`;
    const fallbackImageUrl = `${CERTIFICATE_UPLOAD_PREFIX}${imageFilename}`;
    const pdfOutPath = resolveCertificateOutPath(pdfFilename);
    const imageOutPath = resolveCertificateOutPath(imageFilename);
    const verifyUrl = `${PUBLIC_APP_URL}/verify/${certNo}`;
    const storageProvider = isCloudinaryConfigured ? "cloudinary" : "local";
    const initialImageUrl = storageProvider === "local" ? fallbackImageUrl : "";

    fs.mkdirSync(path.dirname(pdfOutPath), { recursive: true });
    fs.mkdirSync(path.dirname(imageOutPath), { recursive: true });

    let cert = null;
    let uploadedCloudinaryPdfPublicId = "";
    let uploadedCloudinaryPreviewPublicId = "";
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
        pdfUrl: fallbackPdfUrl,
        imageUrl: initialImageUrl,
        storageProvider,
      });

      await generateCertificateAssets({
        pdfOutPath,
        imageOutPath,
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

      if (isCloudinaryConfigured) {
        const uploadedPdf = await uploadCertificatePdfToCloudinary({
          outPath: pdfOutPath,
          certNo,
        });
        uploadedCloudinaryPdfPublicId = uploadedPdf.publicId;
        cert.pdfUrl = uploadedPdf.secureUrl;

        try {
          const uploadedPreview = await uploadCertificatePreviewImageToCloudinary({
            outPath: imageOutPath,
            certNo,
          });
          uploadedCloudinaryPreviewPublicId = uploadedPreview.publicId;
          cert.imageUrl = uploadedPreview.secureUrl;
        } catch (previewError) {
          console.warn(
            `Certificate preview upload failed for ${certNo}: ${previewError?.message || "unknown error"}`
          );
        }

        await cert.save();
      }

      return res.status(201).json({ ok: true, message: "Certificate generated", data: cert });
    } catch (err) {
      if (isCertNoDuplicateError(err) && attempt < 2) {
        continue;
      }

      if (uploadedCloudinaryPdfPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedCloudinaryPdfPublicId, {
            resource_type: "raw",
            invalidate: true,
          });
        } catch {
          // Ignore remote cleanup errors.
        }
      }

      if (uploadedCloudinaryPreviewPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedCloudinaryPreviewPublicId, {
            resource_type: "image",
            invalidate: true,
          });
        } catch {
          // Ignore remote cleanup errors.
        }
      }

      removeFileIfExists(pdfOutPath);
      removeFileIfExists(imageOutPath);

      // Rollback reserved DB row if PDF generation failed after create.
      if (cert?._id) {
        await Certificate.findByIdAndDelete(cert._id);
      }
      throw err;
    } finally {
      if (isCloudinaryConfigured) {
        removeFileIfExists(pdfOutPath);
        removeFileIfExists(imageOutPath);
      }
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
            imageUrl: 1,
            storageProvider: 1,
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

  await deleteCertificatePdfFromCloudinary(cert.certNo);
  await deleteCertificatePreviewImageFromCloudinary(cert.certNo);

  if (cert.pdfUrl) {
    const absPath = resolveSafeCertificateAssetPath(cert.pdfUrl);

    removeFileIfExists(absPath);
  }

  if (cert.imageUrl) {
    const absPath = resolveSafeCertificateAssetPath(cert.imageUrl);

    removeFileIfExists(absPath);
  }

  await Certificate.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: "Certificate deleted" });
});
