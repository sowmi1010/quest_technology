import { z } from "zod";
import Course from "../models/Course.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCourse = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    categoryId: z.string().min(10),
    duration: z.string().min(1),
    totalFee: z.coerce.number().min(0),
    installmentStart: z.coerce.number().min(0).default(5000),
    syllabus: z.string().optional(), // comma separated
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);

  const syllabusArr = body.syllabus
    ? body.syllabus.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const imageUrl = req.file ? `/uploads/courses/${req.file.filename}` : "";

  const course = await Course.create({
    title: body.title,
    categoryId: body.categoryId,
    duration: body.duration,
    totalFee: body.totalFee,
    installmentStart: body.installmentStart ?? 5000,
    syllabus: syllabusArr,
    isPublic: body.isPublic ?? true,
    imageUrl,
  });

  res.status(201).json({ ok: true, message: "Course created", data: course });
});

export const listPublicCourses = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;

  const filter = { isPublic: true };
  if (categoryId) filter.categoryId = categoryId;

  const courses = await Course.find(filter).populate("categoryId", "name slug").sort({ createdAt: -1 });
  res.json({ ok: true, data: courses });
});

export const listAdminCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("categoryId", "name slug").sort({ createdAt: -1 });
  res.json({ ok: true, data: courses });
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("categoryId", "name slug");
  if (!course) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    categoryId: z.string().min(10).optional(),
    duration: z.string().optional(),
    totalFee: z.coerce.number().min(0).optional(),
    installmentStart: z.coerce.number().min(0).optional(),
    syllabus: z.string().optional(),
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);

  const update = { ...body };

  if (body.syllabus !== undefined) {
    update.syllabus = body.syllabus
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (req.file) {
    update.imageUrl = `/uploads/courses/${req.file.filename}`;
  }

  const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!course) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Course updated", data: course });
});
