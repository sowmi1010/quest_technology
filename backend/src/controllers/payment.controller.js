import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildPagination,
  escapeRegex,
  parseBooleanFlag,
  parsePaginationParams,
  parseSortToken,
} from "../utils/listQuery.js";

const PAYMENT_METHODS = Object.freeze(
  Array.isArray(Payment?.schema?.path("method")?.enumValues)
    ? Payment.schema.path("method").enumValues
    : ["Cash", "UPI", "Card", "Bank", "Online"]
);

function normalizePaymentMethod(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const matched = PAYMENT_METHODS.find(
    (item) => item.toLowerCase() === raw.toLowerCase()
  );

  return matched || "";
}

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

  const normalizedMethod = normalizePaymentMethod(method);
  if (!normalizedMethod) {
    return res.status(400).json({
      ok: false,
      message: `Valid payment method is required. Allowed: ${PAYMENT_METHODS.join(", ")}`,
    });
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
    method: normalizedMethod,
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

  const student = await Student.findById(studentId).populate("courseId");
  if (!student) return res.status(404).json({ ok: false, message: "Student not found" });

  const payments = await Payment.find({ studentId }).sort({ date: -1 });

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
  const { page, limit, skip } = parsePaginationParams(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const keyword = String(req.query.keyword || "").trim();
  const batch = String(req.query.batch || "").trim();
  const studentGroup = String(req.query.studentGroup || "").trim().toUpperCase();
  const paymentGroup = String(req.query.paymentGroup || "").trim().toUpperCase();
  const dueOnly = parseBooleanFlag(req.query.dueOnly);

  const inactivityDays = Number.parseInt(String(req.query.inactivityDays || ""), 10);
  const hasInactivityFilter = Number.isFinite(inactivityDays) && inactivityDays > 0;
  const inactivityThreshold = hasInactivityFilter
    ? new Date(Date.now() - inactivityDays * 24 * 60 * 60 * 1000)
    : null;

  const sort = parseSortToken(
    req.query.sort,
    {
      LATEST: { createdAt: -1, _id: -1 },
      latest: { createdAt: -1, _id: -1 },
      newest: { createdAt: -1, _id: -1 },
      NAME: { name: 1, _id: -1 },
      "name:asc": { name: 1, _id: -1 },
      BALANCE: { balance: -1, _id: -1 },
      "balance:desc": { balance: -1, _id: -1 },
      INACTIVE: { lastPaymentSort: 1, _id: -1 },
      "lastPaymentDate:asc": { lastPaymentSort: 1, _id: -1 },
      "createdAt:desc": { createdAt: -1, _id: -1 },
      "createdAt:asc": { createdAt: 1, _id: 1 },
    },
    "createdAt:desc"
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const studentGroupExpr = {
    $cond: [
      { $eq: [{ $toUpper: { $ifNull: ["$status", "ACTIVE"] } }, "INACTIVE"] },
      "COMPLETED",
      {
        $cond: [
          {
            $and: [
              { $gte: ["$studentDateBase", monthStart] },
              { $lt: ["$studentDateBase", monthEnd] },
            ],
          },
          "NEW",
          "EXISTING",
        ],
      },
    ],
  };

  const paymentGroupExpr = {
    $cond: [
      { $lte: ["$totalPaid", 0] },
      "NEW",
      {
        $cond: [
          {
            $or: [
              { $lte: ["$totalFee", 0] },
              { $gte: ["$totalPaid", "$totalFee"] },
            ],
          },
          "COMPLETED",
          "EXISTING",
        ],
      },
    ],
  };

  const pipeline = [
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: {
        path: "$course",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "course.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "payments",
        let: { sid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$studentId", "$$sid"] },
            },
          },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: "$amount" },
              paymentCount: { $sum: 1 },
              lastPaymentDate: { $max: "$date" },
            },
          },
        ],
        as: "paymentAgg",
      },
    },
    {
      $addFields: {
        paymentAgg: {
          $ifNull: [{ $arrayElemAt: ["$paymentAgg", 0] }, {}],
        },
      },
    },
    {
      $addFields: {
        totalFee: {
          $toDouble: { $ifNull: ["$course.totalFee", 0] },
        },
        totalPaid: {
          $toDouble: { $ifNull: ["$paymentAgg.totalPaid", 0] },
        },
        paymentCount: {
          $ifNull: ["$paymentAgg.paymentCount", 0],
        },
        lastPaymentDate: {
          $ifNull: ["$paymentAgg.lastPaymentDate", null],
        },
        courseTitle: {
          $ifNull: ["$course.title", ""],
        },
        categoryName: {
          $ifNull: ["$category.name", ""],
        },
        studentDateBase: {
          $ifNull: ["$joiningDate", "$createdAt"],
        },
      },
    },
    {
      $addFields: {
        balanceRaw: { $subtract: ["$totalFee", "$totalPaid"] },
      },
    },
    {
      $addFields: {
        balance: {
          $cond: [{ $lt: ["$balanceRaw", 0] }, 0, "$balanceRaw"],
        },
        studentGroup: studentGroupExpr,
        paymentGroup: paymentGroupExpr,
        lastPaymentSort: {
          $ifNull: ["$lastPaymentDate", new Date("1970-01-01T00:00:00.000Z")],
        },
      },
    },
  ];

  const conditions = [];

  if (keyword) {
    const keywordRegex = new RegExp(escapeRegex(keyword), "i");
    conditions.push({
      $or: [
        { studentId: keywordRegex },
        { name: keywordRegex },
        { courseTitle: keywordRegex },
        { categoryName: keywordRegex },
        { batchType: keywordRegex },
      ],
    });
  }

  if (batch) {
    conditions.push({ batchType: batch });
  }

  if (studentGroup && ["NEW", "EXISTING", "COMPLETED"].includes(studentGroup)) {
    conditions.push({ studentGroup });
  }

  if (paymentGroup && ["NEW", "EXISTING", "COMPLETED"].includes(paymentGroup)) {
    conditions.push({ paymentGroup });
  }

  if (dueOnly) {
    conditions.push({ balance: { $gt: 0 } });
  }

  if (hasInactivityFilter && inactivityThreshold) {
    conditions.push({
      balance: { $gt: 0 },
      $or: [
        { lastPaymentDate: null },
        { lastPaymentDate: { $lte: inactivityThreshold } },
      ],
    });
  }

  if (conditions.length > 0) {
    pipeline.push({ $match: { $and: conditions } });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            studentMongoId: "$_id",
            studentId: { $ifNull: ["$studentId", ""] },
            name: { $ifNull: ["$name", ""] },
            status: { $ifNull: ["$status", "ACTIVE"] },
            joiningDate: 1,
            createdAt: 1,
            batchType: { $ifNull: ["$batchType", ""] },
            courseTitle: 1,
            categoryName: 1,
            totalFee: 1,
            totalPaid: 1,
            balance: 1,
            paymentCount: 1,
            lastPaymentDate: 1,
            studentGroup: 1,
            paymentGroup: 1,
          },
        },
      ],
      totalMeta: [{ $count: "total" }],
      summary: [
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            dueStudents: {
              $sum: { $cond: [{ $gt: ["$balance", 0] }, 1, 0] },
            },
            totalOutstanding: { $sum: "$balance" },
            newPayments: {
              $sum: { $cond: [{ $eq: ["$paymentGroup", "NEW"] }, 1, 0] },
            },
            existingPayments: {
              $sum: { $cond: [{ $eq: ["$paymentGroup", "EXISTING"] }, 1, 0] },
            },
            completedPayments: {
              $sum: { $cond: [{ $eq: ["$paymentGroup", "COMPLETED"] }, 1, 0] },
            },
            newStudentsMech: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$studentGroup", "NEW"] },
                      {
                        $regexMatch: {
                          input: { $toLower: { $ifNull: ["$categoryName", ""] } },
                          regex: "mech",
                        },
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            newStudentsIt: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$studentGroup", "NEW"] },
                      {
                        $regexMatch: {
                          input: { $toLower: { $ifNull: ["$categoryName", ""] } },
                          regex:
                            "(^|\\s)it(\\s|$)|information technology|computer",
                        },
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            newStudentsAccounts: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$studentGroup", "NEW"] },
                      {
                        $regexMatch: {
                          input: { $toLower: { $ifNull: ["$categoryName", ""] } },
                          regex: "account",
                        },
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            newPaymentCollected: {
              $sum: {
                $cond: [{ $eq: ["$studentGroup", "NEW"] }, "$totalPaid", 0],
              },
            },
            existingPaymentCollected: {
              $sum: {
                $cond: [{ $eq: ["$studentGroup", "EXISTING"] }, "$totalPaid", 0],
              },
            },
            defaultPaymentDue: { $sum: "$balance" },
          },
        },
      ],
    },
  });

  const [result] = await Student.aggregate(pipeline);
  const data = Array.isArray(result?.data) ? result.data : [];
  const total = Number(result?.totalMeta?.[0]?.total || 0);
  const rawSummary = result?.summary?.[0] || {};

  res.json({
    ok: true,
    data,
    pagination: buildPagination(total, page, limit),
    summary: {
      totalStudents: Number(rawSummary.totalStudents || 0),
      dueStudents: Number(rawSummary.dueStudents || 0),
      totalOutstanding: Number(rawSummary.totalOutstanding || 0),
      newPayments: Number(rawSummary.newPayments || 0),
      existingPayments: Number(rawSummary.existingPayments || 0),
      completedPayments: Number(rawSummary.completedPayments || 0),
      newStudentsMech: Number(rawSummary.newStudentsMech || 0),
      newStudentsIt: Number(rawSummary.newStudentsIt || 0),
      newStudentsAccounts: Number(rawSummary.newStudentsAccounts || 0),
      newPaymentCollected: Number(rawSummary.newPaymentCollected || 0),
      existingPaymentCollected: Number(rawSummary.existingPaymentCollected || 0),
      defaultPaymentDue: Number(rawSummary.defaultPaymentDue || 0),
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
