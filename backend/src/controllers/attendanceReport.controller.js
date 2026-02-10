import Attendance from "../models/Attendance.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Report by date range + optional batchType
 * Query:
 *  - start=YYYY-MM-DD
 *  - end=YYYY-MM-DD
 *  - batchType=Mon/Wed/Fri (optional)
 */
export const attendanceReport = asyncHandler(async (req, res) => {
  const { start, end, batchType } = req.query;

  if (!start || !end) {
    return res.status(400).json({ ok: false, message: "start and end are required" });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const match = {
    date: { $gte: startDate, $lte: endDate },
  };

  if (batchType) match.batchType = batchType;

  const rows = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$studentId",
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $lookup: {
        from: "courses",
        localField: "student.courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        studentMongoId: "$student._id",
        studentId: "$student.studentId",
        name: "$student.name",
        photoUrl: "$student.photoUrl",
        batchType: "$student.batchType",
        courseTitle: "$course.title",
        totalDays: 1,
        presentDays: 1,
        absentDays: 1,
        percentage: {
          $cond: [
            { $gt: ["$totalDays", 0] },
            { $round: [{ $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100] }, 0] },
            0,
          ],
        },
      },
    },
    { $sort: { name: 1 } },
  ]);

  res.json({
    ok: true,
    meta: { start, end, batchType: batchType || "ALL", count: rows.length },
    data: rows,
  });
});
