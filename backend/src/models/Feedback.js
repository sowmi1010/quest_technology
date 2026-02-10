import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    course: { type: String, trim: true },
    feedback: { type: String, required: true, trim: true },

    company: { type: String, trim: true },

    rating: { type: Number, min: 1, max: 5, default: 5 }, // ✅ NEW

    imageUrl: { type: String, default: "" }, // ✅ NEW (uploaded image)

    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "PLACED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
