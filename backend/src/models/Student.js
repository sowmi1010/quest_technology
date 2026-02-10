import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, unique: true, trim: true },
    name: { type: String, required: true, trim: true },

    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    fatherName: { type: String, trim: true },
    fatherNumber: { type: String, trim: true },
    studentNumber: { type: String, trim: true },

    address: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },

    batchType: { type: String, trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },

    photoUrl: { type: String, default: "" }, // ✅ NEW
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
