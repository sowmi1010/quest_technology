import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isCurrentMonth(dateValue, refDate = new Date()) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === refDate.getFullYear() && d.getMonth() === refDate.getMonth();
}

function getStudentGroup(student, refDate = new Date()) {
  const status = String(student?.status || "ACTIVE").toUpperCase();
  if (status === "INACTIVE") return "COMPLETED";
  if (isCurrentMonth(student?.joiningDate || student?.createdAt, refDate)) return "NEW";
  return "EXISTING";
}

function getPaymentGroup(totalFee, totalPaid) {
  const fee = Number(totalFee || 0);
  const paid = Number(totalPaid || 0);

  if (paid <= 0) return "NEW";
  if (fee <= 0) return "COMPLETED";
  if (paid >= fee) return "COMPLETED";
  return "EXISTING";
}

function parsePaymentDate(value) {
  if (!value) return new Date();

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/* =============================
   Add Payment
============================= */
export const addPayment = asyncHandler(async (req, res) => {
  const { studentId, amount, method, date, note } = req.body;

  const amountValue = Number(amount);
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    return res.status(400).json({ ok: false, message: "Valid amount is required" });
  }

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const paymentDate = parsePaymentDate(date);
  if (!paymentDate) {
    return res.status(400).json({ ok: false, message: "Valid payment date is required" });
  }

  const pay = await Payment.create({
    studentId,
    amount: amountValue,
    method,
    date: paymentDate,
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
   Payments Overview (All students)
============================= */
export const getPaymentsOverview = asyncHandler(async (req, res) => {
  const [students, paymentAgg] = await Promise.all([
    Student.find()
      .populate({
        path: "courseId",
        select: "title totalFee duration categoryId",
        populate: { path: "categoryId", select: "name slug" },
      })
      .sort({ createdAt: -1 }),
    Payment.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalPaid: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: "$date" },
        },
      },
    ]),
  ]);

  const aggByStudent = new Map(
    paymentAgg.map((row) => [
      String(row._id),
      {
        totalPaid: Number(row.totalPaid || 0),
        paymentCount: Number(row.paymentCount || 0),
        lastPaymentDate: row.lastPaymentDate || null,
      },
    ])
  );

  const now = new Date();

  const rows = students.map((s) => {
    const agg = aggByStudent.get(String(s._id)) || {
      totalPaid: 0,
      paymentCount: 0,
      lastPaymentDate: null,
    };

    const totalFee = Number(s?.courseId?.totalFee || 0);
    const totalPaid = Number(agg.totalPaid || 0);
    const balance = Math.max(0, totalFee - totalPaid);

    return {
      studentMongoId: s._id,
      studentId: s.studentId || "",
      name: s.name || "",
      status: s.status || "ACTIVE",
      joiningDate: s.joiningDate || null,
      createdAt: s.createdAt || null,
      batchType: s.batchType || "",
      courseTitle: s?.courseId?.title || "",
      categoryName: s?.courseId?.categoryId?.name || "",
      totalFee,
      totalPaid,
      balance,
      paymentCount: agg.paymentCount || 0,
      lastPaymentDate: agg.lastPaymentDate || null,
      studentGroup: getStudentGroup(s, now),
      paymentGroup: getPaymentGroup(totalFee, totalPaid),
    };
  });

  res.json({ ok: true, data: rows });
});

/* =============================
   Delete payment
============================= */
export const deletePayment = asyncHandler(async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: "Payment deleted" });
});
