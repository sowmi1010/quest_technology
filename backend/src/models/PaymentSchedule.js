import mongoose from "mongoose";

const paymentScheduleSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    installmentNo: { type: Number, required: true }, // 1,2,3...

    dueDate: { type: Date, required: true },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["DUE", "PAID"],
      default: "DUE",
    },

    paidPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true }
);

paymentScheduleSchema.index({ studentId: 1, installmentNo: 1 }, { unique: true });

export default mongoose.model("PaymentSchedule", paymentScheduleSchema);
