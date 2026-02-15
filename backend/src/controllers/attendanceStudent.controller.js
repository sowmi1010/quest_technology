import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/attendance/student/:studentId?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export const getStudentAttendanceRange = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ ok: false, message: "start and end are required" });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const list = await Attendance.find({
    studentId,
    date: { $gte: startDate, $lte: endDate },
  })
    .select("date status")
    .sort({ date: 1 });

  res.json({ ok: true, data: list });
});

/**
 * PATCH /api/attendance/student/:studentId
 * body: { date: "YYYY-MM-DD", status: "PRESENT"|"ABSENT" }
 */
export const setStudentAttendanceByDate = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { date, status } = req.body || {};

  if (!date || !status) {
    return res.status(400).json({ ok: false, message: "date and status are required" });
  }

  if (status !== "PRESENT" && status !== "ABSENT") {
    return res.status(400).json({ ok: false, message: "status must be PRESENT or ABSENT" });
  }

  const student = await Student.findById(studentId).select("batchType");
  if (!student) {
    return res.status(404).json({ ok: false, message: "Student not found" });
  }

  if (!student.batchType) {
    return res.status(400).json({ ok: false, message: "Student batch type is missing" });
  }

  const day = new Date(date);
  if (Number.isNaN(day.getTime())) {
    return res.status(400).json({ ok: false, message: "Invalid date" });
  }

  const doc = await Attendance.findOneAndUpdate(
    { studentId, date: day },
    {
      $set: {
        date: day,
        studentId,
        status,
        batchType: student.batchType,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).select("date status");

  res.json({ ok: true, message: "Attendance updated", data: doc });
});
