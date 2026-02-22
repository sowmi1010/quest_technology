import { z } from "zod";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUploadedFileUrl } from "../utils/uploadFileUrl.js";

const SYLLABUS_ITEM_TYPES = new Set(["LESSON", "PROJECT"]);

function parseFlatSyllabus(raw) {
  if (!raw || typeof raw !== "string") return [];

  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeSyllabusModules(rawModules) {
  if (!Array.isArray(rawModules)) return [];

  return rawModules
    .map((module, moduleIdx) => {
      const rawTitle = typeof module?.title === "string" ? module.title.trim() : "";
      const rawItems = Array.isArray(module?.items) ? module.items : [];

      const items = rawItems
        .map((item) => {
          const itemTitle = typeof item?.title === "string" ? item.title.trim() : "";
          if (!itemTitle) return null;

          const type = String(item?.type || "LESSON").toUpperCase();
          return {
            title: itemTitle,
            type: SYLLABUS_ITEM_TYPES.has(type) ? type : "LESSON",
          };
        })
        .filter(Boolean);

      if (!rawTitle && items.length === 0) return null;

      return {
        title: rawTitle || `Module ${moduleIdx + 1}`,
        items,
      };
    })
    .filter(Boolean);
}

function parseSyllabusModulesInput(rawValue) {
  if (rawValue === undefined) return { ok: true, value: undefined };

  if (typeof rawValue !== "string") return { ok: false, value: [] };

  const trimmed = rawValue.trim();
  if (!trimmed) return { ok: true, value: [] };

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return { ok: false, value: [] };

    return { ok: true, value: normalizeSyllabusModules(parsed) };
  } catch {
    return { ok: false, value: [] };
  }
}

function modulesFromFlatTopics(topics) {
  if (!Array.isArray(topics) || topics.length === 0) return [];

  return [
    {
      title: "Module 1",
      items: topics.map((topic) => ({ title: topic, type: "LESSON" })),
    },
  ];
}

function flattenSyllabusModules(modules) {
  if (!Array.isArray(modules)) return [];

  return modules
    .flatMap((module) => (Array.isArray(module?.items) ? module.items : []))
    .map((item) => item?.title)
    .filter(Boolean);
}

export const createCourse = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    categoryId: z.string().min(10),
    duration: z.string().min(1),
    totalFee: z.coerce.number().min(0),
    installmentStart: z.coerce.number().min(0).default(5000),
    syllabus: z.string().optional(), // comma separated (legacy)
    syllabusModules: z.string().optional(), // JSON string
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);

  const parsedModules = parseSyllabusModulesInput(body.syllabusModules);
  if (!parsedModules.ok) {
    res.status(400);
    throw new Error("Invalid syllabusModules format. Expected JSON array.");
  }

  const legacyTopics = parseFlatSyllabus(body.syllabus);
  const modules =
    parsedModules.value !== undefined ? parsedModules.value : modulesFromFlatTopics(legacyTopics);

  const flatTopics = flattenSyllabusModules(modules);

  const imageUrl = getUploadedFileUrl(req.file);

  const course = await Course.create({
    title: body.title,
    categoryId: body.categoryId,
    duration: body.duration,
    totalFee: body.totalFee,
    installmentStart: body.installmentStart ?? 5000,
    syllabus: flatTopics.length > 0 ? flatTopics : legacyTopics,
    syllabusModules: modules,
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
    syllabusModules: z.string().optional(),
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);

  const update = { ...body };
  delete update.syllabusModules;

  if (body.syllabus !== undefined) {
    update.syllabus = parseFlatSyllabus(body.syllabus);
    update.syllabusModules = modulesFromFlatTopics(update.syllabus);
  }

  if (body.syllabusModules !== undefined) {
    const parsedModules = parseSyllabusModulesInput(body.syllabusModules);
    if (!parsedModules.ok) {
      res.status(400);
      throw new Error("Invalid syllabusModules format. Expected JSON array.");
    }

    const modules = parsedModules.value || [];
    update.syllabusModules = modules;
    update.syllabus = flattenSyllabusModules(modules);
  }

  if (req.file) {
    update.imageUrl = getUploadedFileUrl(req.file);
  }

  const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!course) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Course updated", data: course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrolledCount = await Student.countDocuments({ courseId: id });
  if (enrolledCount > 0) {
    return res.status(409).json({
      ok: false,
      message: "Cannot delete this course because students are enrolled.",
      data: { enrolledCount },
    });
  }

  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Course deleted" });
});
