import { z } from "zod";
import Enquiry from "../models/Enquiry.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createEnquiry = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    category: z.string().optional(),
    course: z.string().min(2),
    preferredBatch: z.string().optional(),
    message: z.string().optional(),
  });

  const data = schema.parse(req.body);

  const enquiry = await Enquiry.create(data);

  res.status(201).json({
    ok: true,
    message: "Enquiry submitted",
    data: enquiry,
  });
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  res.json({ ok: true, data: enquiries });
});

export const getEnquiryById = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: enquiry });
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const schema = z.object({
    status: z.enum(["NEW", "CALLED", "INTERESTED", "JOINED", "NOT_INTERESTED"]).optional(),
    notes: z.string().optional(),
  });

  const update = schema.parse(req.body);

  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!enquiry) return res.status(404).json({ ok: false, message: "Not found" });

  res.json({ ok: true, message: "Updated", data: enquiry });
});
