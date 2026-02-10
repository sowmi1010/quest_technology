import Attendance from "../models/Attendance.js";
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
