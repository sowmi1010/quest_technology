import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certNo: { type: String, unique: true, required: true, trim: true },

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    startDate: { type: Date },
    endDate: { type: Date },
    issueDate: { type: Date, default: Date.now },

    performance: { type: String, trim: true }, // Weekly / Excellent / Good
    remarks: { type: String, trim: true },

    pdfUrl: { type: String, required: true, trim: true }, // Cloudinary secure URL
    imageUrl: { type: String, trim: true, default: "" }, // Optional preview image URL
    storageProvider: {
      type: String,
      enum: ["cloudinary"],
      default: "cloudinary",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
