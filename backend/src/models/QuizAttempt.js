import mongoose from "mongoose";

const quizAnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    selectedOptionIndex: { type: Number, default: null, min: 0 },
    isCorrect: { type: Boolean, default: false },
    timedOut: { type: Boolean, default: false },
    timeTakenMs: { type: Number, default: 0, min: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    quizTitle: { type: String, required: true, trim: true },

    studentName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },

    attemptToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"],
      default: "IN_PROGRESS",
      index: true,
    },

    currentQuestionIndex: { type: Number, default: 0, min: 0 },
    questionStartedAt: { type: Date, default: Date.now },

    answers: { type: [quizAnswerSchema], default: [] },

    score: { type: Number, default: 0, min: 0 },
    totalQuestions: { type: Number, default: 0, min: 0 },
    maxScore: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },

    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quizId: 1, createdAt: -1 });
quizAttemptSchema.index({ quizId: 1, phoneNumber: 1, status: 1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
