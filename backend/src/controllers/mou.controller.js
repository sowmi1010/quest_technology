import Mou from "../models/Mou.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUploadedFileUrl } from "../utils/uploadFileUrl.js";

export const createMouItem = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Image is required" });
  }

  const item = await Mou.create({
    imageUrl: getUploadedFileUrl(req.file),
  });

  res.status(201).json({ ok: true, message: "MoU image created", data: item });
});

export const listPublicMouItems = asyncHandler(async (req, res) => {
  const items = await Mou.find().sort({ createdAt: -1 });
  res.json({ ok: true, data: items });
});

export const listAdminMouItems = asyncHandler(async (req, res) => {
  const items = await Mou.find().sort({ createdAt: -1 });
  res.json({ ok: true, data: items });
});

export const getMouItem = asyncHandler(async (req, res) => {
  const item = await Mou.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: item });
});

export const updateMouItem = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Image is required" });
  }

  const item = await Mou.findByIdAndUpdate(
    req.params.id,
    { imageUrl: getUploadedFileUrl(req.file) },
    { new: true, runValidators: true }
  );

  if (!item) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "MoU image updated", data: item });
});

export const deleteMouItem = asyncHandler(async (req, res) => {
  const item = await Mou.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, message: "MoU image deleted" });
});
