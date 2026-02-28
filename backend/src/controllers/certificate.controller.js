import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import cloudinary, { ensureCloudinaryConfigured } from "../config/cloudinary.js";
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

const CERTIFICATE_CLOUDINARY_PREFIX = "quest-technology/certificates";
const CERTIFICATE_CLOUDINARY_PREVIEW_PREFIX = "quest-technology/certificate-previews";
const CLOUDINARY_REQUIRED_MESSAGE =
  "Certificate generation is disabled because Cloudinary is not configured.";

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

function buildCloudinaryCertificatePublicId(certNo) {
  return `${CERTIFICATE_CLOUDINARY_PREFIX}/${certNo}`;
}

function buildCloudinaryCertificatePreviewPublicId(certNo) {
  return `${CERTIFICATE_CLOUDINARY_PREVIEW_PREFIX}/${certNo}`;
}

function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result || {});
    });

    uploadStream.end(buffer);
  });
}

async function uploadCertificatePdfToCloudinary({ pdfBuffer, certNo }) {
  const publicId = buildCloudinaryCertificatePublicId(certNo);
  const uploaded = await uploadBufferToCloudinary(pdfBuffer, {
    resource_type: "raw",
    public_id: publicId,
    format: "pdf",
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

async function uploadCertificatePreviewImageToCloudinary({ imageBuffer, certNo }) {
  const publicId = buildCloudinaryCertificatePreviewPublicId(certNo);
  const uploaded = await uploadBufferToCloudinary(imageBuffer, {
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
  if (!certNo || !ensureCloudinaryConfigured()) return;

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
  if (!certNo || !ensureCloudinaryConfigured()) return;

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

function isCertNoDuplicateError(err) {
  return (
    err?.code === 11000 &&
    (err?.keyPattern?.certNo || err?.keyValue?.certNo)
  );
}

export const issueCertificate = asyncHandler(async (req, res) => {
  if (!ensureCloudinaryConfigured()) {
    return res.status(503).json({
      ok: false,
      message: CLOUDINARY_REQUIRED_MESSAGE,
    });
  }

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

    const pendingPdfUrl = `cloudinary://pending/${certNo}.pdf`;
    const verifyUrl = `${PUBLIC_APP_URL}/verify/${certNo}`;
    const storageProvider = "cloudinary";

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
        pdfUrl: pendingPdfUrl,
        imageUrl: "",
        storageProvider,
      });

      const { pdfBuffer, imageBuffer } = await generateCertificateAssets({
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

      const uploadedPdf = await uploadCertificatePdfToCloudinary({
        pdfBuffer,
        certNo,
      });
      uploadedCloudinaryPdfPublicId = uploadedPdf.publicId;
      cert.pdfUrl = uploadedPdf.secureUrl;

      try {
        const uploadedPreview = await uploadCertificatePreviewImageToCloudinary({
          imageBuffer,
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

      // Rollback reserved DB row if PDF generation failed after create.
      if (cert?._id) {
        await Certificate.findByIdAndDelete(cert._id);
      }
      throw err;
    }
  }

  return res.status(500).json({
    ok: false,
    message: "Failed to issue certificate after multiple retries.",
  });
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

  await Certificate.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: "Certificate deleted" });
});
