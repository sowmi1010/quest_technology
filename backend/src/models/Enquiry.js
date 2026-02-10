import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    category: { type: String, trim: true }, // IT / Mechanical / Accounts
    course: { type: String, required: true, trim: true },
    preferredBatch: { type: String, trim: true }, // MWF / TTS / Weekdays+Sun
    message: { type: String, trim: true },

    status: {
      type: String,
      enum: ["NEW", "CALLED", "INTERESTED", "JOINED", "NOT_INTERESTED"],
      default: "NEW",
    },

    notes: { type: String, trim: true }, // admin internal notes
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
