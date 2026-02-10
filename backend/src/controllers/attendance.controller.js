import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* =========================================
   Get students by batch for marking
========================================= */
export const getStudentsByBatch = asyncHandler(async (req, res) => {
  const { batchType } = req.query;

  const students = await Student.find({
    batchType,
    status: "ACTIVE",
  }).populate("courseId", "title");

  res.json({ ok: true, data: students });
});

/* =========================================
   Save attendance (bulk)
========================================= */
export const saveAttendance = asyncHandler(async (req, res) => {
  const { date, records, batchType } = req.body;

  const d = new Date(date);

  // delete old if exists (edit support)
  await Attendance.deleteMany({ date: d, batchType });

  const docs = records.map((r) => ({
    date: d,
    studentId: r.studentId,
    status: r.status,
    batchType,
  }));

  await Attendance.insertMany(docs);

  res.json({ ok: true, message: "Attendance saved" });
});

/* =========================================
   Get attendance by date
========================================= */
export const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { date, batchType } = req.query;

  const list = await Attendance.find({
    date: new Date(date),
    batchType,
  }).populate("studentId", "name studentId photoUrl");

  res.json({ ok: true, data: list });
});
