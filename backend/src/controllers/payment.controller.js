import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* =============================
   Add Payment
============================= */
export const addPayment = asyncHandler(async (req, res) => {
  const { studentId, amount, method, date, note } = req.body;

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const pay = await Payment.create({
    studentId,
    amount,
    method,
    date: date ? new Date(date) : new Date(),
    note,
  });

  res.status(201).json({ ok: true, message: "Payment added", data: pay });
});

/* =============================
   Student Payment History
============================= */
export const getStudentPayments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const payments = await Payment.find({ studentId }).sort({ date: -1 });

  const student = await Student.findById(studentId).populate("courseId");

  const totalFee = student.courseId?.totalFee || 0;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    ok: true,
    data: {
      payments,
      summary: {
        totalFee,
        totalPaid,
        balance: totalFee - totalPaid,
      },
    },
  });
});

/* =============================
   Delete payment
============================= */
export const deletePayment = asyncHandler(async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: "Payment deleted" });
});
