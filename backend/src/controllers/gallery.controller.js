import { z } from "zod";
import Gallery from "../models/Gallery.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GALLERY_CATEGORIES } from "../utils/gallery.constants.js";
import { getUploadedFileUrl } from "../utils/uploadFileUrl.js";

const categoryEnum = z.enum(GALLERY_CATEGORIES);
const listQuerySchema = z.object({
  category: z.preprocess((value) => {
    if (value == null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    if (!normalized || normalized === "ALL") return undefined;
    return normalized;
  }, categoryEnum.optional()),
});

export const createGalleryItem = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().trim().max(120).optional(),
    description: z.string().trim().max(600).optional(),
    category: categoryEnum,
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);

  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Image is required" });
  }

  const item = await Gallery.create({
    title: body.title || "",
    description: body.description || "",
    category: body.category,
    isPublic: body.isPublic ?? true,
    imageUrl: getUploadedFileUrl(req.file),
  });

  res.status(201).json({ ok: true, message: "Gallery item created", data: item });
});

export const listPublicGalleryItems = asyncHandler(async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid category filter",
    });
  }

  const query = parsed.data;
  const filter = { isPublic: true };

  if (query.category) filter.category = query.category;

  const items = await Gallery.find(filter).sort({ createdAt: -1 });
  res.json({ ok: true, data: items });
});

export const listAdminGalleryItems = asyncHandler(async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid category filter",
    });
  }

  const query = parsed.data;
  const filter = {};

  if (query.category) filter.category = query.category;

  const items = await Gallery.find(filter).sort({ createdAt: -1 });
  res.json({ ok: true, data: items });
});

export const getGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: item });
});

export const updateGalleryItem = asyncHandler(async (req, res) => {
  const schema = z.object({
    title: z.string().trim().max(120).optional(),
    description: z.string().trim().max(600).optional(),
    category: categoryEnum.optional(),
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);
  const update = { ...body };

  if (req.file) {
    update.imageUrl = getUploadedFileUrl(req.file);
  }

  const item = await Gallery.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Gallery item updated", data: item });
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, message: "Gallery item deleted" });
});
