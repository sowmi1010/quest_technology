import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank", "Online"],
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
