import { z } from "zod";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";
import PerformanceUpdate from "../models/PerformanceUpdate.js";
import Certificate from "../models/Certificate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateStudentId } from "../utils/generateId.js";
import { getNextStudentSerial } from "../utils/studentIdSequence.js";
import { getUploadedFileUrl } from "../utils/uploadFileUrl.js";
import { parseOptionalIsoDateInput } from "../utils/dateValidation.js";
import {
  buildPagination,
  escapeRegex,
  parsePaginationParams,
  parseSortToken,
} from "../utils/listQuery.js";

function isStudentIdDuplicateError(err) {
  return (
    err?.code === 11000 &&
    (err?.keyPattern?.studentId || err?.keyValue?.studentId)
  );
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function buildAttendanceSummary(presentCount, absentCount) {
  const present = Number(presentCount || 0);
  const absent = Number(absentCount || 0);
  const totalMarked = present + absent;

  return {
    present,
    absent,
    totalMarked,
    attendancePercent: totalMarked ? Math.round((present / totalMarked) * 100) : 0,
  };
}

function normalizeMonthToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (!/^\d{4}-\d{2}$/.test(raw)) return null;

  const [yearToken, monthToken] = raw.split("-");
  const year = Number(yearToken);
  const monthNumber = Number(monthToken);

  if (!Number.isFinite(year) || !Number.isFinite(monthNumber)) return null;
  if (monthNumber < 1 || monthNumber > 12) return null;

  return {
    year,
    monthIndex: monthNumber - 1,
    token: `${year}-${String(monthNumber).padStart(2, "0")}`,
  };
}

function resolveMonthRange(monthQuery) {
  const parsed = normalizeMonthToken(monthQuery);
  const fallbackNow = new Date();
  const year = parsed ? parsed.year : fallbackNow.getFullYear();
  const monthIndex = parsed ? parsed.monthIndex : fallbackNow.getMonth();

  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  return {
    token: parsed
      ? parsed.token
      : `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    start,
    end,
  };
}

export const createStudent = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    courseId: z.string().min(10),
    fatherName: z.string().optional(),
    fatherNumber: z.string().optional(),
    studentNumber: z.string().optional(),
    address: z.string().optional(),
    joiningDate: z.string().optional(),
    batchType: z.string().optional(),
  });

  const body = schema.parse(req.body);
  const parsedJoiningDate = parseOptionalIsoDateInput(body.joiningDate, "joiningDate");
  if (!parsedJoiningDate.ok) {
    return res.status(400).json({ ok: false, message: parsedJoiningDate.message });
  }

  const photoUrl = getUploadedFileUrl(req.file);

  // Retry on duplicate studentId in case legacy/manual data created gaps/collisions.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const serial = await getNextStudentSerial();
    const studentId = generateStudentId(serial);

    try {
      const student = await Student.create({
        studentId,
        name: body.name,
        courseId: body.courseId,
        fatherName: body.fatherName || "",
        fatherNumber: body.fatherNumber || "",
        studentNumber: body.studentNumber || "",
        address: body.address || "",
        joiningDate: parsedJoiningDate.provided ? parsedJoiningDate.value : new Date(),
        batchType: body.batchType || "",
        photoUrl,
      });

      return res.status(201).json({ ok: true, message: "Student added", data: student });
    } catch (err) {
      if (isStudentIdDuplicateError(err) && attempt < 9) {
        continue;
      }
      throw err;
    }
  }

  return res.status(409).json({
    ok: false,
    message: "Unable to assign a unique student ID. Please retry.",
  });
});

export const listStudents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const keyword = String(req.query.keyword || "").trim();
  const status = String(req.query.status || "").trim().toUpperCase();
  const batch = String(req.query.batch || "").trim();
  const studentGroup = String(req.query.studentGroup || "").trim().toUpperCase();

  const sort = parseSortToken(
    req.query.sort,
    {
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      "name:asc": { name: 1, _id: -1 },
      "name:desc": { name: -1, _id: -1 },
      "createdAt:desc": { createdAt: -1, _id: -1 },
      "createdAt:asc": { createdAt: 1, _id: 1 },
      "joiningDate:desc": { joiningDate: -1, _id: -1 },
      "joiningDate:asc": { joiningDate: 1, _id: 1 },
    },
    "createdAt:desc"
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const studentDateExpr = { $ifNull: ["$joiningDate", "$createdAt"] };
  const studentGroupExpr = {
    $cond: [
      { $eq: [{ $toUpper: { $ifNull: ["$status", "ACTIVE"] } }, "INACTIVE"] },
      "COMPLETED",
      {
        $cond: [
          {
            $and: [
              { $gte: [studentDateExpr, monthStart] },
              { $lt: [studentDateExpr, monthEnd] },
            ],
          },
          "NEW",
          "EXISTING",
        ],
      },
    ],
  };

  const pipeline = [
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
    {
      $addFields: {
        studentGroup: studentGroupExpr,
      },
    },
  ];

  const conditions = [];

  if (status === "ACTIVE" || status === "INACTIVE") {
    conditions.push({ status });
  }

  if (batch) {
    conditions.push({ batchType: batch });
  }

  if (studentGroup && ["NEW", "EXISTING", "COMPLETED"].includes(studentGroup)) {
    conditions.push({ studentGroup });
  }

  if (keyword) {
    const keywordRegex = new RegExp(escapeRegex(keyword), "i");
    conditions.push({
      $or: [
        { studentId: keywordRegex },
        { name: keywordRegex },
        { studentNumber: keywordRegex },
        { fatherNumber: keywordRegex },
        { batchType: keywordRegex },
        { "course.title": keywordRegex },
      ],
    });
  }

  if (conditions.length > 0) {
    pipeline.push({ $match: { $and: conditions } });
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
            studentId: 1,
            name: 1,
            fatherName: 1,
            fatherNumber: 1,
            studentNumber: 1,
            address: 1,
            joiningDate: 1,
            batchType: 1,
            status: 1,
            photoUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            studentGroup: 1,
            courseId: {
              _id: "$course._id",
              title: "$course.title",
              duration: "$course.duration",
              totalFee: "$course.totalFee",
              installmentStart: "$course.installmentStart",
            },
          },
        },
      ],
      totalMeta: [{ $count: "total" }],
      summary: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            newStudents: {
              $sum: { $cond: [{ $eq: ["$studentGroup", "NEW"] }, 1, 0] },
            },
            existingStudents: {
              $sum: { $cond: [{ $eq: ["$studentGroup", "EXISTING"] }, 1, 0] },
            },
            completedStudents: {
              $sum: { $cond: [{ $eq: ["$studentGroup", "COMPLETED"] }, 1, 0] },
            },
          },
        },
      ],
    },
  });

  const [result] = await Student.aggregate(pipeline);
  const data = Array.isArray(result?.data) ? result.data : [];
  const total = Number(result?.totalMeta?.[0]?.total || 0);
  const pagination = buildPagination(total, page, limit);
  const summary = result?.summary?.[0] || {
    total: 0,
    newStudents: 0,
    existingStudents: 0,
    completedStudents: 0,
  };

  res.json({
    ok: true,
    data,
    pagination,
    summary: {
      total: Number(summary.total || 0),
      newStudents: Number(summary.newStudents || 0),
      existingStudents: Number(summary.existingStudents || 0),
      completedStudents: Number(summary.completedStudents || 0),
    },
  });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate("courseId", "title duration totalFee");
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: student });
});

export const getStudentMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const monthRange = resolveMonthRange(req.query.month);

  const student = await Student.findById(id)
    .populate("courseId", "title duration totalFee installmentStart")
    .lean();

  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const [
    monthAttendance,
    presentTotal,
    absentTotal,
    payments,
    performanceUpdates,
    certificates,
  ] = await Promise.all([
    Attendance.find({
      studentId: id,
      date: { $gte: monthRange.start, $lte: monthRange.end },
    })
      .select("date status")
      .sort({ date: 1, _id: 1 })
      .lean(),
    Attendance.countDocuments({ studentId: id, status: "PRESENT" }),
    Attendance.countDocuments({ studentId: id, status: "ABSENT" }),
    Payment.find({ studentId: id })
      .select("amount method date note createdAt")
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .lean(),
    PerformanceUpdate.find({ studentId: id })
      .select("toolName status startDate endDate performanceMessage createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .lean(),
    Certificate.find({ studentId: id })
      .select(
        "certNo courseId startDate endDate issueDate performance remarks pdfUrl imageUrl storageProvider createdAt"
      )
      .populate("courseId", "title duration")
      .sort({ issueDate: -1, createdAt: -1, _id: -1 })
      .lean(),
  ]);

  const attendanceCalendar = monthAttendance.map((row) => ({
    _id: row._id,
    date: row.date,
    dateKey: toDateKey(row.date),
    status: row.status,
  }));

  const monthPresent = attendanceCalendar.filter((row) => row.status === "PRESENT").length;
  const monthAbsent = attendanceCalendar.filter((row) => row.status === "ABSENT").length;

  const totalFee = Number(student?.courseId?.totalFee || 0);
  const totalPaid = payments.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );
  const paymentBalanceRaw = totalFee - totalPaid;
  const balance = paymentBalanceRaw > 0 ? paymentBalanceRaw : 0;
  const paymentProgress = totalFee > 0
    ? Math.min(100, Math.max(0, Math.round((totalPaid / totalFee) * 100)))
    : totalPaid > 0
      ? 100
      : 0;

  const performanceSummary = {
    total: performanceUpdates.length,
    completed: performanceUpdates.filter((row) => row.status === "COMPLETED").length,
    inProgress: performanceUpdates.filter((row) => row.status === "IN_PROGRESS").length,
    onHold: performanceUpdates.filter((row) => row.status === "ON_HOLD").length,
  };

  const latestCertificate = certificates[0] || null;

  res.json({
    ok: true,
    data: {
      student,
      attendance: {
        month: monthRange.token,
        range: {
          start: monthRange.start,
          end: monthRange.end,
        },
        calendar: attendanceCalendar,
        monthSummary: buildAttendanceSummary(monthPresent, monthAbsent),
        overallSummary: buildAttendanceSummary(presentTotal, absentTotal),
      },
      payments: {
        summary: {
          totalFee,
          totalPaid,
          balance,
          paymentCount: payments.length,
          paymentProgress,
          lastPaymentDate: payments[0]?.date || null,
        },
        records: payments,
      },
      performance: {
        summary: performanceSummary,
        records: performanceUpdates,
      },
      certificates: {
        summary: {
          total: certificates.length,
          latestIssueDate: latestCertificate?.issueDate || null,
        },
        records: certificates,
      },
    },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    courseId: z.string().min(10).optional(),
    fatherName: z.string().optional(),
    fatherNumber: z.string().optional(),
    studentNumber: z.string().optional(),
    address: z.string().optional(),
    joiningDate: z.string().optional(),
    batchType: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  });

  const body = schema.parse(req.body);
  const update = { ...body };
  delete update.joiningDate;

  const parsedJoiningDate = parseOptionalIsoDateInput(body.joiningDate, "joiningDate");
  if (!parsedJoiningDate.ok) {
    return res.status(400).json({ ok: false, message: parsedJoiningDate.message });
  }

  if (parsedJoiningDate.provided) update.joiningDate = parsedJoiningDate.value;
  if (req.file) update.photoUrl = getUploadedFileUrl(req.file);

  const student = await Student.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Student updated", data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, message: "Student deleted" });
});
