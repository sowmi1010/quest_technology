import { z } from "zod";
import Student from "../models/Student.js";
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
  for (let attempt = 0; attempt < 3; attempt += 1) {
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
      if (isStudentIdDuplicateError(err) && attempt < 2) {
        continue;
      }
      throw err;
    }
  }
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
