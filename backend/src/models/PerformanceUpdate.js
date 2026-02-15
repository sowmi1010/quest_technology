import mongoose from "mongoose";

const performanceUpdateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    toolName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "ON_HOLD"],
      default: "IN_PROGRESS",
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    performanceMessage: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("PerformanceUpdate", performanceUpdateSchema);
