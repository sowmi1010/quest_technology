import mongoose from "mongoose";
import { GALLERY_CATEGORIES } from "../utils/gallery.constants.js";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    category: { type: String, enum: GALLERY_CATEGORIES, required: true },
    imageUrl: { type: String, required: true, trim: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
