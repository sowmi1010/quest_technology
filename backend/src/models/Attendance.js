import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      required: true,
    },

    batchType: {
      type: String, // Mon/Wed/Fri
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate entry same day
attendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
