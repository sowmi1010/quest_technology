import { z } from "zod";
import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_CATEGORIES = [
  { name: "Accounts", slug: "accounts" },
  { name: "IT", slug: "it" },
  { name: "Mechanical", slug: "mechanical" },
];

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function ensureDefaultCategories() {
  for (const item of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate(
      { slug: item.slug },
      { $setOnInsert: { ...item, isPublic: true } },
      { upsert: true, new: false }
    );
  }
}

export const listPublicCategories = asyncHandler(async (req, res) => {
  await ensureDefaultCategories();

  const categories = await Category.find({ isPublic: true })
    .select("name slug isPublic")
    .sort({ name: 1 });

  res.json({ ok: true, data: categories });
});

export const listAdminCategories = asyncHandler(async (req, res) => {
  await ensureDefaultCategories();

  const categories = await Category.find()
    .select("name slug isPublic")
    .sort({ name: 1 });

  res.json({ ok: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    slug: z.string().optional(),
    isPublic: z.coerce.boolean().optional(),
  });

  const body = schema.parse(req.body);
  const slug = slugify(body.slug || body.name);

  if (!slug) {
    return res.status(400).json({ ok: false, message: "Invalid category name" });
  }

  const exists = await Category.findOne({ slug });
  if (exists) {
    return res.status(409).json({ ok: false, message: "Category already exists" });
  }

  const category = await Category.create({
    name: body.name.trim(),
    slug,
    isPublic: body.isPublic ?? true,
  });

  res.status(201).json({ ok: true, message: "Category created", data: category });
});
