import { z } from "zod";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateStudentId } from "../utils/generateId.js";

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

  const count = await Student.countDocuments();
  const studentId = generateStudentId(count + 1);

  const photoUrl = req.file ? `/uploads/students/${req.file.filename}` : "";

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

  res.status(201).json({ ok: true, message: "Student added", data: student });
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
  if (req.file) update.photoUrl = `/uploads/students/${req.file.filename}`;

  const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Student updated", data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, message: "Student deleted" });
});
