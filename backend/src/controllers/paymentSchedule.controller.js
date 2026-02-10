import PaymentSchedule from "../models/PaymentSchedule.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildInstallments } from "../utils/installmentSchedule.js";

/* =============================
   Generate schedule for student
============================= */
export const generateScheduleForStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const course = await Course.findById(student.courseId);
  if (!course) return res.status(404).json({ ok: false, message: "Course not found" });

  // prevent duplicates: clear old schedule
  await PaymentSchedule.deleteMany({ studentId });

  const items = buildInstallments({
    totalFee: course.totalFee,
    installmentStart: course.installmentStart || 5000,
    startDate: student.joiningDate || new Date(),
    gapDays: 30,
  });

  const docs = items.map((x) => ({ ...x, studentId }));

  await PaymentSchedule.insertMany(docs);

  res.json({ ok: true, message: "Schedule generated", data: docs });
});

/* =============================
   Get schedule for student
============================= */
export const getStudentSchedule = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const list = await PaymentSchedule.find({ studentId }).sort({ installmentNo: 1 });

  res.json({ ok: true, data: list });
});

/* =============================
   Mark installment paid
   - creates Payment entry also
============================= */
export const markInstallmentPaid = asyncHandler(async (req, res) => {
  const { id } = req.params; // scheduleId
  const { method, note, date } = req.body;

  const schedule = await PaymentSchedule.findById(id);
  if (!schedule) return res.status(404).json({ ok: false, message: "Schedule not found" });

  if (schedule.status === "PAID") {
    return res.status(400).json({ ok: false, message: "Already paid" });
  }

  // create Payment history record
  const pay = await Payment.create({
    studentId: schedule.studentId,
    amount: schedule.amount,
    method: method || "Cash",
    note: note || `Installment #${schedule.installmentNo}`,
    date: date ? new Date(date) : new Date(),
  });

  schedule.status = "PAID";
  schedule.paidPaymentId = pay._id;
  await schedule.save();

  res.json({ ok: true, message: "Installment marked paid", data: schedule });
});
