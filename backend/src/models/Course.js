import mongoose from "mongoose";

const syllabusItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["LESSON", "PROJECT"], default: "LESSON" },
  },
  { _id: false }
);

const syllabusModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    items: { type: [syllabusItemSchema], default: [] },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    duration: { type: String, required: true, trim: true },
    totalFee: { type: Number, required: true },
    installmentStart: { type: Number, default: 5000 },

    // Backward-compatible flat topics list
    syllabus: [{ type: String, trim: true }],
    // New structured syllabus with modules/lessons/projects
    syllabusModules: { type: [syllabusModuleSchema], default: [] },

    imageUrl: { type: String, default: "" }, // uploads url
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
