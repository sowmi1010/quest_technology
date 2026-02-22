import { z } from "zod";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateStudentId } from "../utils/generateId.js";
import { getNextStudentSerial } from "../utils/studentIdSequence.js";
import { getUploadedFileUrl } from "../utils/uploadFileUrl.js";

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
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
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
  const students = await Student.find()
    .populate("courseId", "title duration totalFee installmentStart")
    .sort({ createdAt: -1 });

  res.json({ ok: true, data: students });
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

  if (body.joiningDate) update.joiningDate = new Date(body.joiningDate);
  if (req.file) update.photoUrl = getUploadedFileUrl(req.file);

  const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Student updated", data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, message: "Student deleted" });
});
