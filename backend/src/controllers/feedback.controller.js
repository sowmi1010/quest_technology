import Feedback from "../models/Feedback.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUploadedFileUrl } from "../utils/uploadFileUrl.js";

/* =============================
   Create feedback
============================= */
export const createFeedback = asyncHandler(async (req, res) => {
  const { name, course, feedback, company, status, rating } = req.body;

  if (!name || !feedback) {
    return res.status(400).json({ ok: false, message: "name and feedback are required" });
  }

  const imageUrl = getUploadedFileUrl(req.file);

  const doc = await Feedback.create({
    name,
    course: course || "",
    feedback,
    company: company || "",
    status: status || "NEW",
    rating: rating ? Number(rating) : 5,
    imageUrl,
  });

  res.status(201).json({ ok: true, message: "Feedback saved", data: doc });
});


/* =============================
   List feedback
============================= */
export const listFeedback = asyncHandler(async (req, res) => {
  const isPublic = req.path.includes("/public");

  let query = {};

  if (isPublic) {
    query = { rating: { $gte: 4 }, status: "PLACED" }; // only good ones
  }

  const list = await Feedback.find(query).sort({ createdAt: -1 });

  res.json({ ok: true, data: list });
});


/* =============================
   Update feedback (status/company)
============================= */
export const updateFeedback = asyncHandler(async (req, res) => {
  const { status, company, course, feedback, name, rating } = req.body;

  const update = {
    status,
    company,
    course,
    feedback,
    name,
  };

  if (rating) update.rating = Number(rating);
  if (req.file) update.imageUrl = getUploadedFileUrl(req.file);

  const updated = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!updated) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Feedback updated", data: updated });
});


/* =============================
   Delete feedback
============================= */
export const deleteFeedback = asyncHandler(async (req, res) => {
  const doc = await Feedback.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, message: "Feedback deleted" });
});


export const getFeedbackById = asyncHandler(async (req, res) => {
  const doc = await Feedback.findById(req.params.id);
  if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: doc });
});


