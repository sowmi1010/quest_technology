import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import {
  createQuiz,
  deleteQuiz,
  getCurrentQuizQuestion,
  getPublicQuizByShareToken,
  getQuizAttemptResult,
  getQuizById,
  listQuizAttempts,
  listQuizzes,
  regenerateQuizShareLink,
  registerQuizAttempt,
  submitQuizAnswer,
  updateQuiz,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Public
router.get("/public/:shareToken", getPublicQuizByShareToken);
router.post("/public/:shareToken/register", registerQuizAttempt);
router.get("/public/attempts/:attemptToken/current", getCurrentQuizQuestion);
router.post("/public/attempts/:attemptToken/answer", submitQuizAnswer);
router.get("/public/attempts/:attemptToken/result", getQuizAttemptResult);

// Admin
router.get("/", adminProtect, listQuizzes);
router.post("/", adminProtect, createQuiz);
router.get("/:id", adminProtect, getQuizById);
router.patch("/:id", adminProtect, updateQuiz);
router.delete("/:id", adminProtect, deleteQuiz);
router.post("/:id/regenerate-link", adminProtect, regenerateQuizShareLink);
router.get("/:id/attempts", adminProtect, listQuizAttempts);

export default router;
