import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";

import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPagination, escapeRegex, parsePaginationParams } from "../utils/listQuery.js";

const createQuizSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1200).optional().default(""),
  secondsPerQuestion: z.coerce.number().int().min(5).max(300).optional().default(30),
  isActive: z.coerce.boolean().optional().default(true),
  questions: z.any(),
});

const updateQuizSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(1200).optional(),
  secondsPerQuestion: z.coerce.number().int().min(5).max(300).optional(),
  isActive: z.coerce.boolean().optional(),
  questions: z.any().optional(),
});

const registerAttemptSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  department: z.string().trim().min(2).max(120),
  phoneNumber: z.string().trim().min(6).max(30),
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function trimText(value = "") {
  return String(value || "").trim();
}

function normalizePhoneNumber(value = "") {
  const raw = trimText(value);
  if (!raw) return "";

  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return raw.startsWith("+") ? `+${digits}` : digits;
}

function extractClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return trimText(forwarded[0]);
  }

  if (typeof forwarded === "string" && forwarded) {
    return trimText(forwarded.split(",")[0]);
  }

  return trimText(req.ip || req.socket?.remoteAddress || "");
}

function getPublicBaseUrl(req) {
  const fromEnv = trimText(process.env.PUBLIC_APP_URL).replace(/\/+$/, "");
  if (fromEnv) return fromEnv;

  const fromSiteEnv = trimText(process.env.SITE_URL || process.env.VITE_SITE_URL).replace(/\/+$/, "");
  if (fromSiteEnv) return fromSiteEnv;

  const fromOrigin = trimText(req.get("origin")).replace(/\/+$/, "");
  if (fromOrigin) return fromOrigin;

  const host = trimText(req.get("host"));
  if (host) return `${req.protocol}://${host}`;

  return "";
}

function buildShareUrl(req, shareToken) {
  const base = getPublicBaseUrl(req);
  return base ? `${base}/quiz/${shareToken}` : `/quiz/${shareToken}`;
}

async function generateUniqueToken(model, fieldName, byteLength = 12) {
  for (let i = 0; i < 12; i += 1) {
    const token = crypto.randomBytes(byteLength).toString("hex");
    const exists = await model.exists({ [fieldName]: token });
    if (!exists) return token;
  }

  throw httpError(500, "Unable to generate secure token. Please try again.");
}

function parseQuestionsInput(rawValue, { required }) {
  if (rawValue === undefined) {
    if (required) throw httpError(400, "questions are required");
    return undefined;
  }

  let parsed = rawValue;

  if (typeof parsed === "string") {
    const trimmed = parsed.trim();
    if (!trimmed) {
      throw httpError(400, "questions are required");
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw httpError(400, "questions must be a valid JSON array");
    }
  }

  if (!Array.isArray(parsed)) {
    throw httpError(400, "questions must be an array");
  }

  if (parsed.length === 0) {
    throw httpError(400, "At least one question is required");
  }

  return parsed.map((question, index) => {
    const idx = index + 1;
    const prompt = trimText(question?.prompt);

    if (!prompt) throw httpError(400, `Question ${idx}: prompt is required`);

    const options = Array.isArray(question?.options)
      ? question.options.map((item) => trimText(item)).filter(Boolean)
      : [];

    if (options.length < 2) {
      throw httpError(400, `Question ${idx}: at least two options are required`);
    }

    const correctOptionIndex = Number(question?.correctOptionIndex);
    if (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
      throw httpError(400, `Question ${idx}: invalid correct option index`);
    }

    return {
      prompt,
      options,
      correctOptionIndex,
    };
  });
}

function getQuestionStartTime(attempt) {
  const fallback = attempt.startedAt || attempt.createdAt || new Date();
  return new Date(attempt.questionStartedAt || fallback);
}

function getQuestionDeadline(quiz, attempt) {
  const start = getQuestionStartTime(attempt).getTime();
  const ttlMs = Number(quiz.secondsPerQuestion || 30) * 1000;
  return new Date(start + ttlMs);
}

function questionCountForQuiz(quiz) {
  return Array.isArray(quiz?.questions) ? quiz.questions.length : 0;
}

function computeAttemptScore(attempt, quiz) {
  const totalQuestions = questionCountForQuiz(quiz);
  const score = Array.isArray(attempt.answers)
    ? attempt.answers.reduce((sum, answer) => sum + (answer?.isCorrect ? 1 : 0), 0)
    : 0;
  const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;

  attempt.score = score;
  attempt.totalQuestions = totalQuestions;
  attempt.maxScore = totalQuestions;
  attempt.percentage = percentage;
}

function finalizeAttempt(quiz, attempt, { autoSubmitted = false } = {}) {
  computeAttemptScore(attempt, quiz);
  attempt.status = autoSubmitted ? "AUTO_SUBMITTED" : "SUBMITTED";
  attempt.submittedAt = new Date();
  attempt.currentQuestionIndex = questionCountForQuiz(quiz);
}

function buildQuestionPayload(quiz, attempt) {
  const totalQuestions = questionCountForQuiz(quiz);
  const currentIndex = Number(attempt.currentQuestionIndex || 0);
  if (currentIndex < 0 || currentIndex >= totalQuestions) return null;

  const question = quiz.questions[currentIndex];
  if (!question) return null;

  return {
    questionIndex: currentIndex,
    questionNumber: currentIndex + 1,
    totalQuestions,
    prompt: question.prompt,
    options: question.options,
    secondsPerQuestion: Number(quiz.secondsPerQuestion || 30),
    windowEndsAt: getQuestionDeadline(quiz, attempt).toISOString(),
  };
}

function buildResultPayload(quiz, attempt) {
  const totalQuestions = questionCountForQuiz(quiz) || Number(attempt.totalQuestions || 0);
  const score = Number(attempt.score || 0);
  const percentage =
    totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : Number(attempt.percentage || 0);

  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];

  return {
    attemptId: attempt._id,
    attemptToken: attempt.attemptToken,
    quizId: attempt.quizId,
    quizTitle: quiz.title || attempt.quizTitle,
    studentName: attempt.studentName,
    department: attempt.department,
    phoneNumber: attempt.phoneNumber,
    score,
    totalQuestions,
    percentage,
    correctAnswers: answers.filter((item) => item?.isCorrect).length,
    answeredQuestions: answers.filter((item) => item?.selectedOptionIndex !== null).length,
    timedOutQuestions: answers.filter((item) => item?.timedOut).length,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
  };
}

function tryAutoTimeoutCurrentQuestion(quiz, attempt) {
  if (attempt.status !== "IN_PROGRESS") return false;

  const totalQuestions = questionCountForQuiz(quiz);
  const currentIndex = Number(attempt.currentQuestionIndex || 0);
  if (currentIndex < 0 || currentIndex >= totalQuestions) return false;

  const deadline = getQuestionDeadline(quiz, attempt);
  if (Date.now() <= deadline.getTime()) return false;

  attempt.answers.push({
    questionIndex: currentIndex,
    selectedOptionIndex: null,
    isCorrect: false,
    timedOut: true,
    timeTakenMs: Number(quiz.secondsPerQuestion || 30) * 1000,
    answeredAt: new Date(),
  });

  attempt.currentQuestionIndex = currentIndex + 1;
  attempt.questionStartedAt = new Date();

  if (attempt.currentQuestionIndex >= totalQuestions) {
    finalizeAttempt(quiz, attempt, { autoSubmitted: true });
  }

  return true;
}

function parseAnswerPayload(body = {}) {
  const questionIndex = Number(body?.questionIndex);
  if (!Number.isInteger(questionIndex) || questionIndex < 0) {
    throw httpError(400, "questionIndex is required");
  }

  let selectedOptionIndex = body?.selectedOptionIndex;
  if (selectedOptionIndex === "" || selectedOptionIndex === undefined) {
    selectedOptionIndex = null;
  }

  if (selectedOptionIndex !== null) {
    selectedOptionIndex = Number(selectedOptionIndex);
    if (!Number.isInteger(selectedOptionIndex) || selectedOptionIndex < 0) {
      throw httpError(400, "selectedOptionIndex is invalid");
    }
  }

  const timedOutRaw = body?.timedOut;
  const timedOut =
    timedOutRaw === true ||
    timedOutRaw === 1 ||
    timedOutRaw === "1" ||
    String(timedOutRaw || "").toLowerCase() === "true";

  return {
    questionIndex,
    selectedOptionIndex,
    timedOut,
  };
}

function quizListItem(quiz, req, stats = {}) {
  return {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    isActive: Boolean(quiz.isActive),
    secondsPerQuestion: Number(quiz.secondsPerQuestion || 30),
    questionCount: questionCountForQuiz(quiz),
    shareToken: quiz.shareToken,
    shareUrl: buildShareUrl(req, quiz.shareToken),
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    stats: {
      registrations: Number(stats.registrations || 0),
      submissions: Number(stats.submissions || 0),
      avgScore: Number(Number(stats.avgScore || 0).toFixed(2)),
      highestScore: Number(stats.highestScore || 0),
    },
  };
}

/* =============================
   Admin
============================= */

export const createQuiz = asyncHandler(async (req, res) => {
  const parsed = createQuizSchema.parse(req.body || {});
  const questions = parseQuestionsInput(parsed.questions, { required: true });

  const shareToken = await generateUniqueToken(Quiz, "shareToken", 8);

  const quiz = await Quiz.create({
    title: parsed.title,
    description: parsed.description || "",
    secondsPerQuestion: parsed.secondsPerQuestion ?? 30,
    isActive: parsed.isActive ?? true,
    questions,
    shareToken,
    createdBy: req.admin?._id || null,
  });

  res.status(201).json({
    ok: true,
    message: "Quiz created",
    data: {
      ...quiz.toObject(),
      shareUrl: buildShareUrl(req, quiz.shareToken),
      questionCount: questionCountForQuiz(quiz),
    },
  });
});

export const listQuizzes = asyncHandler(async (req, res) => {
  const q = trimText(req.query?.q);
  const status = trimText(req.query?.status).toLowerCase();

  const filter = {};
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const quizzes = await Quiz.find(filter)
    .select("title description isActive secondsPerQuestion shareToken questions createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  const quizIds = quizzes.map((quiz) => quiz._id);
  const statRows =
    quizIds.length === 0
      ? []
      : await QuizAttempt.aggregate([
          { $match: { quizId: { $in: quizIds } } },
          {
            $group: {
              _id: "$quizId",
              registrations: { $sum: 1 },
              submissions: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
              avgScore: { $avg: "$score" },
              highestScore: { $max: "$score" },
            },
          },
        ]);

  const statsMap = new Map(statRows.map((row) => [String(row._id), row]));
  const data = quizzes.map((quiz) => quizListItem(quiz, req, statsMap.get(String(quiz._id))));

  res.json({ ok: true, data });
});

export const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).lean();
  if (!quiz) {
    return res.status(404).json({ ok: false, message: "Quiz not found" });
  }

  const [stats] = await QuizAttempt.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $group: {
        _id: "$quizId",
        registrations: { $sum: 1 },
        submissions: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
        avgScore: { $avg: "$score" },
        highestScore: { $max: "$score" },
      },
    },
  ]);

  res.json({
    ok: true,
    data: {
      ...quiz,
      shareUrl: buildShareUrl(req, quiz.shareToken),
      questionCount: questionCountForQuiz(quiz),
      stats: {
        registrations: Number(stats?.registrations || 0),
        submissions: Number(stats?.submissions || 0),
        avgScore: Number(Number(stats?.avgScore || 0).toFixed(2)),
        highestScore: Number(stats?.highestScore || 0),
      },
    },
  });
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const parsed = updateQuizSchema.parse(req.body || {});
  const update = {};

  if (parsed.title !== undefined) update.title = parsed.title;
  if (parsed.description !== undefined) update.description = parsed.description;
  if (parsed.secondsPerQuestion !== undefined) update.secondsPerQuestion = parsed.secondsPerQuestion;
  if (parsed.isActive !== undefined) update.isActive = parsed.isActive;
  if (parsed.questions !== undefined) {
    update.questions = parseQuestionsInput(parsed.questions, { required: false });
  }

  if (Object.keys(update).length === 0) {
    throw httpError(400, "No valid fields provided for update");
  }

  const quiz = await Quiz.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  res.json({
    ok: true,
    message: "Quiz updated",
    data: {
      ...quiz.toObject(),
      shareUrl: buildShareUrl(req, quiz.shareToken),
      questionCount: questionCountForQuiz(quiz),
    },
  });
});

export const regenerateQuizShareLink = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  quiz.shareToken = await generateUniqueToken(Quiz, "shareToken", 8);
  await quiz.save();

  res.json({
    ok: true,
    message: "Share link regenerated",
    data: {
      _id: quiz._id,
      shareToken: quiz.shareToken,
      shareUrl: buildShareUrl(req, quiz.shareToken),
    },
  });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  const deletedAttempts = await QuizAttempt.deleteMany({ quizId: req.params.id });

  res.json({
    ok: true,
    message: "Quiz deleted",
    data: { deletedAttempts: Number(deletedAttempts?.deletedCount || 0) },
  });
});

export const listQuizAttempts = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).select("title").lean();
  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  const { page, limit, skip } = parsePaginationParams(req.query, {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  });

  const q = trimText(req.query?.q);
  const status = trimText(req.query?.status).toUpperCase();

  const filter = { quizId: req.params.id };
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ studentName: regex }, { department: regex }, { phoneNumber: regex }];
  }

  if (["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"].includes(status)) {
    filter.status = status;
  }

  const [items, total, statRows] = await Promise.all([
    QuizAttempt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    QuizAttempt.countDocuments(filter),
    QuizAttempt.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: "$quizId",
          registrations: { $sum: 1 },
          submissions: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
          avgScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
        },
      },
    ]),
  ]);

  const [stats] = statRows;
  const data = items.map((attempt) => ({
    _id: attempt._id,
    attemptToken: attempt.attemptToken,
    studentName: attempt.studentName,
    department: attempt.department,
    phoneNumber: attempt.phoneNumber,
    status: attempt.status,
    score: Number(attempt.score || 0),
    totalQuestions: Number(attempt.totalQuestions || 0),
    percentage: Number(attempt.percentage || 0),
    answeredCount: Array.isArray(attempt.answers) ? attempt.answers.length : 0,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    createdAt: attempt.createdAt,
  }));

  res.json({
    ok: true,
    data,
    pagination: buildPagination(total, page, limit),
    quiz: { _id: quiz._id, title: quiz.title },
    stats: {
      registrations: Number(stats?.registrations || 0),
      submissions: Number(stats?.submissions || 0),
      avgScore: Number(Number(stats?.avgScore || 0).toFixed(2)),
      highestScore: Number(stats?.highestScore || 0),
    },
  });
});

/* =============================
   Public
============================= */

export const getPublicQuizByShareToken = asyncHandler(async (req, res) => {
  const shareToken = trimText(req.params.shareToken);
  const quiz = await Quiz.findOne({ shareToken, isActive: true })
    .select("title description secondsPerQuestion questions")
    .lean();

  if (!quiz) {
    return res.status(404).json({ ok: false, message: "Quiz link is invalid or inactive" });
  }

  res.json({
    ok: true,
    data: {
      title: quiz.title,
      description: quiz.description || "",
      secondsPerQuestion: Number(quiz.secondsPerQuestion || 30),
      questionCount: questionCountForQuiz(quiz),
    },
  });
});

export const registerQuizAttempt = asyncHandler(async (req, res) => {
  const shareToken = trimText(req.params.shareToken);
  const quiz = await Quiz.findOne({ shareToken, isActive: true }).lean();

  if (!quiz) {
    return res.status(404).json({ ok: false, message: "Quiz link is invalid or inactive" });
  }

  if (questionCountForQuiz(quiz) === 0) {
    throw httpError(400, "Quiz has no questions");
  }

  const parsed = registerAttemptSchema.parse(req.body || {});
  const phoneNumber = normalizePhoneNumber(parsed.phoneNumber);
  if (!phoneNumber || phoneNumber.length < 6) {
    throw httpError(400, "Please enter a valid phone number");
  }

  let attempt = await QuizAttempt.findOne({
    quizId: quiz._id,
    phoneNumber,
    status: "IN_PROGRESS",
  }).sort({ createdAt: -1 });

  if (!attempt) {
    const attemptToken = await generateUniqueToken(QuizAttempt, "attemptToken", 12);

    attempt = await QuizAttempt.create({
      quizId: quiz._id,
      quizTitle: quiz.title,
      studentName: parsed.studentName,
      department: parsed.department,
      phoneNumber,
      attemptToken,
      totalQuestions: questionCountForQuiz(quiz),
      maxScore: questionCountForQuiz(quiz),
      questionStartedAt: new Date(),
      startedAt: new Date(),
      ipAddress: extractClientIp(req),
      userAgent: trimText(req.headers["user-agent"]),
    });
  } else {
    tryAutoTimeoutCurrentQuestion(quiz, attempt);
    if (attempt.isModified()) {
      await attempt.save();
    }
  }

  if (attempt.status !== "IN_PROGRESS") {
    return res.json({
      ok: true,
      data: {
        attemptToken: attempt.attemptToken,
        completed: true,
        result: buildResultPayload(quiz, attempt),
      },
    });
  }

  const current = buildQuestionPayload(quiz, attempt);

  res.status(201).json({
    ok: true,
    message: "Registration successful",
    data: {
      attemptToken: attempt.attemptToken,
      completed: false,
      quiz: {
        title: quiz.title,
        description: quiz.description || "",
        secondsPerQuestion: Number(quiz.secondsPerQuestion || 30),
        questionCount: questionCountForQuiz(quiz),
      },
      current,
      progress: {
        answeredCount: Array.isArray(attempt.answers) ? attempt.answers.length : 0,
        totalQuestions: questionCountForQuiz(quiz),
      },
    },
  });
});

export const getCurrentQuizQuestion = asyncHandler(async (req, res) => {
  const attemptToken = trimText(req.params.attemptToken);
  const attempt = await QuizAttempt.findOne({ attemptToken });
  if (!attempt) return res.status(404).json({ ok: false, message: "Attempt not found" });

  const quiz = await Quiz.findById(attempt.quizId).lean();
  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  const timedOut = tryAutoTimeoutCurrentQuestion(quiz, attempt);
  if (timedOut) await attempt.save();

  if (attempt.status !== "IN_PROGRESS") {
    return res.json({
      ok: true,
      data: {
        completed: true,
        result: buildResultPayload(quiz, attempt),
      },
    });
  }

  res.json({
    ok: true,
    data: {
      completed: false,
      quiz: {
        title: quiz.title,
        description: quiz.description || "",
      },
      current: buildQuestionPayload(quiz, attempt),
      progress: {
        answeredCount: Array.isArray(attempt.answers) ? attempt.answers.length : 0,
        totalQuestions: questionCountForQuiz(quiz),
      },
    },
  });
});

export const submitQuizAnswer = asyncHandler(async (req, res) => {
  const attemptToken = trimText(req.params.attemptToken);
  const attempt = await QuizAttempt.findOne({ attemptToken });
  if (!attempt) return res.status(404).json({ ok: false, message: "Attempt not found" });

  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  const totalQuestions = questionCountForQuiz(quiz);
  if (totalQuestions === 0) throw httpError(400, "Quiz has no questions");

  const payload = parseAnswerPayload(req.body || {});

  if (attempt.status !== "IN_PROGRESS") {
    return res.json({
      ok: true,
      data: {
        completed: true,
        result: buildResultPayload(quiz, attempt),
      },
    });
  }

  const timedOutBeforeAnswer = tryAutoTimeoutCurrentQuestion(quiz, attempt);
  if (timedOutBeforeAnswer) {
    await attempt.save();
  }

  if (attempt.status !== "IN_PROGRESS") {
    return res.json({
      ok: true,
      data: {
        completed: true,
        result: buildResultPayload(quiz, attempt),
      },
    });
  }

  if (payload.questionIndex !== attempt.currentQuestionIndex) {
    return res.status(409).json({
      ok: false,
      message: "Question already locked. Fetch the current question.",
      data: {
        current: buildQuestionPayload(quiz, attempt),
      },
    });
  }

  const question = quiz.questions[payload.questionIndex];
  if (!question) {
    finalizeAttempt(quiz, attempt, { autoSubmitted: true });
    await attempt.save();
    return res.json({
      ok: true,
      data: {
        completed: true,
        result: buildResultPayload(quiz, attempt),
      },
    });
  }

  if (
    payload.selectedOptionIndex !== null &&
    payload.selectedOptionIndex >= (Array.isArray(question.options) ? question.options.length : 0)
  ) {
    throw httpError(400, "selectedOptionIndex is invalid");
  }

  const startTime = getQuestionStartTime(attempt).getTime();
  const elapsedMs = Math.max(0, Date.now() - startTime);
  const deadlineMs = Number(quiz.secondsPerQuestion || 30) * 1000;
  const serverTimedOut = elapsedMs >= deadlineMs;

  if (payload.selectedOptionIndex === null && !payload.timedOut && !serverTimedOut) {
    throw httpError(400, "Please select an option before moving to next question");
  }

  const selectedOptionIndex = payload.selectedOptionIndex;
  const isCorrect =
    selectedOptionIndex !== null &&
    Number.isInteger(selectedOptionIndex) &&
    selectedOptionIndex === question.correctOptionIndex;

  attempt.answers.push({
    questionIndex: payload.questionIndex,
    selectedOptionIndex,
    isCorrect,
    timedOut: Boolean(payload.timedOut || serverTimedOut),
    timeTakenMs: Math.min(elapsedMs, deadlineMs),
    answeredAt: new Date(),
  });

  attempt.currentQuestionIndex = payload.questionIndex + 1;
  attempt.questionStartedAt = new Date();

  const complete = attempt.currentQuestionIndex >= totalQuestions;
  if (complete) {
    finalizeAttempt(quiz, attempt, { autoSubmitted: Boolean(payload.timedOut || serverTimedOut) });
  }

  await attempt.save();

  if (complete) {
    return res.json({
      ok: true,
      message: "Quiz submitted",
      data: {
        completed: true,
        result: buildResultPayload(quiz, attempt),
      },
    });
  }

  res.json({
    ok: true,
    data: {
      completed: false,
      current: buildQuestionPayload(quiz, attempt),
      progress: {
        answeredCount: Array.isArray(attempt.answers) ? attempt.answers.length : 0,
        totalQuestions,
      },
    },
  });
});

export const getQuizAttemptResult = asyncHandler(async (req, res) => {
  const attemptToken = trimText(req.params.attemptToken);
  const attempt = await QuizAttempt.findOne({ attemptToken });
  if (!attempt) return res.status(404).json({ ok: false, message: "Attempt not found" });

  const quiz = await Quiz.findById(attempt.quizId).lean();
  if (!quiz) return res.status(404).json({ ok: false, message: "Quiz not found" });

  if (attempt.status === "IN_PROGRESS") {
    const changed = tryAutoTimeoutCurrentQuestion(quiz, attempt);
    if (changed) await attempt.save();
  }

  if (attempt.status === "IN_PROGRESS") {
    return res.status(409).json({
      ok: false,
      message: "Quiz is still in progress",
      data: {
        completed: false,
        current: buildQuestionPayload(quiz, attempt),
      },
    });
  }

  res.json({
    ok: true,
    data: {
      completed: true,
      result: buildResultPayload(quiz, attempt),
    },
  });
});
