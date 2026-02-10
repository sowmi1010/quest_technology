import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    duration: { type: String, required: true, trim: true },
    totalFee: { type: Number, required: true },
    installmentStart: { type: Number, default: 5000 },

    syllabus: [{ type: String, trim: true }],

    imageUrl: { type: String, default: "" }, // ✅ new (uploads url)
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
