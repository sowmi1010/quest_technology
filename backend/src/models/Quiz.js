import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2;
        },
        message: "Each question must have at least 2 options.",
      },
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value) {
          return Array.isArray(this.options) && Number.isInteger(value) && value < this.options.length;
        },
        message: "Correct option index is invalid.",
      },
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    secondsPerQuestion: { type: Number, default: 30, min: 5, max: 300 },
    isActive: { type: Boolean, default: true },
    shareToken: { type: String, required: true, unique: true, index: true },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Quiz must have at least one question.",
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

quizSchema.index({ createdAt: -1 });
quizSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Quiz", quizSchema);
