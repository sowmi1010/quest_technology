import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import Student from "../models/Student.js";
import PerformanceUpdate from "../models/PerformanceUpdate.js";

const statusEnum = z.enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"]);

function parseOptionalDate(value, fieldName) {
  if (value === undefined) return { provided: false, value: undefined };
  if (value === null || value === "") return { provided: true, value: null };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { provided: true, invalid: true, fieldName };
  }

  return { provided: true, value: date };
}

export const createPerformanceUpdate = asyncHandler(async (req, res) => {
  const schema = z.object({
    studentId: z.string().min(10),
    toolName: z.string().trim().min(2),
    status: statusEnum.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    performanceMessage: z.string().trim().max(2000).optional(),
  });

  const body = schema.parse(req.body);

  const student = await Student.findById(body.studentId);
  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const startDate = parseOptionalDate(body.startDate, "start date");
  const endDate = parseOptionalDate(body.endDate, "end date");

  if (startDate.invalid) {
    return res.status(400).json({ ok: false, message: `Invalid ${startDate.fieldName}` });
  }

  if (endDate.invalid) {
    return res.status(400).json({ ok: false, message: `Invalid ${endDate.fieldName}` });
  }

  if (startDate.value && endDate.value && endDate.value < startDate.value) {
    return res.status(400).json({
      ok: false,
      message: "End date cannot be earlier than start date",
    });
  }

  const item = await PerformanceUpdate.create({
    studentId: body.studentId,
    toolName: body.toolName,
    status: body.status || "IN_PROGRESS",
    startDate: startDate.value ?? null,
    endDate: endDate.value ?? null,
    performanceMessage: body.performanceMessage || "",
  });

  res.status(201).json({ ok: true, message: "Performance update created", data: item });
});

export const listStudentPerformanceUpdates = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const items = await PerformanceUpdate.find({ studentId }).sort({ createdAt: -1 });
  res.json({ ok: true, data: items });
});

export const updatePerformanceUpdate = asyncHandler(async (req, res) => {
  const schema = z.object({
    toolName: z.string().trim().min(2).optional(),
    status: statusEnum.optional(),
    startDate: z.union([z.string(), z.null()]).optional(),
    endDate: z.union([z.string(), z.null()]).optional(),
    performanceMessage: z.string().trim().max(2000).optional(),
  });

  const body = schema.parse(req.body);
  const update = {};

  if (body.toolName !== undefined) update.toolName = body.toolName;
  if (body.status !== undefined) update.status = body.status;
  if (body.performanceMessage !== undefined) update.performanceMessage = body.performanceMessage;

  const startDate = parseOptionalDate(body.startDate, "start date");
  const endDate = parseOptionalDate(body.endDate, "end date");

  if (startDate.invalid) {
    return res.status(400).json({ ok: false, message: `Invalid ${startDate.fieldName}` });
  }

  if (endDate.invalid) {
    return res.status(400).json({ ok: false, message: `Invalid ${endDate.fieldName}` });
  }

  if (startDate.provided) update.startDate = startDate.value;
  if (endDate.provided) update.endDate = endDate.value;

  const existing = await PerformanceUpdate.findById(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: "Not found" });

  const finalStart = update.startDate !== undefined ? update.startDate : existing.startDate;
  const finalEnd = update.endDate !== undefined ? update.endDate : existing.endDate;

  if (finalStart && finalEnd && finalEnd < finalStart) {
    return res.status(400).json({
      ok: false,
      message: "End date cannot be earlier than start date",
    });
  }

  const item = await PerformanceUpdate.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ ok: true, message: "Performance update updated", data: item });
});

export const deletePerformanceUpdate = asyncHandler(async (req, res) => {
  const item = await PerformanceUpdate.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Performance update deleted" });
});
