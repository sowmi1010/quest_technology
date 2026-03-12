import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Plus, Save, Trash2 } from "lucide-react";

import AdminToast from "../../../components/admin/common/AdminToast";
import { createQuiz, getQuiz, regenerateQuizLink, updateQuiz } from "../../../services/quizApi";

const SITE_URL = String(import.meta.env.VITE_SITE_URL || "").trim().replace(/\/+$/, "");

function makeEmptyQuestion() {
  return {
    prompt: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
  };
}

function normalizeQuestion(raw = {}) {
  const options = Array.isArray(raw.options) ? raw.options.map((item) => String(item || "")) : [];
  const fixedOptions = options.length >= 2 ? options : ["", ""];

  return {
    prompt: String(raw.prompt || ""),
    options: fixedOptions,
    correctOptionIndex: Number.isInteger(raw.correctOptionIndex) ? raw.correctOptionIndex : 0,
  };
}

function resolveShareUrl(shareToken = "", fallback = "") {
  const token = String(shareToken || "").trim();
  if (token && SITE_URL) return `${SITE_URL}/quiz/${token}`;

  if (token && typeof window !== "undefined") {
    const origin = String(window.location?.origin || "").replace(/\/+$/, "");
    if (origin) return `${origin}/quiz/${token}`;
  }
  return String(fallback || "");
}

export default function QuizForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [shareToken, setShareToken] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    secondsPerQuestion: 30,
    isActive: true,
    questions: [makeEmptyQuestion()],
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, type, message: "" }),
      2200
    );
  };

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const res = await getQuiz(id);
        const quiz = res?.data?.data || {};

        setForm({
          title: quiz.title || "",
          description: quiz.description || "",
          secondsPerQuestion: Number(quiz.secondsPerQuestion || 30),
          isActive: Boolean(quiz.isActive),
          questions: Array.isArray(quiz.questions) && quiz.questions.length > 0
            ? quiz.questions.map(normalizeQuestion)
            : [makeEmptyQuestion()],
        });

        setShareUrl(quiz.shareUrl || "");
        setShareToken(quiz.shareToken || "");
      } catch (error) {
        showToast(error?.response?.data?.message || "Failed to load quiz", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuestion = (questionIndex, patch) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex] = { ...questions[questionIndex], ...patch };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({ ...prev, questions: [...prev.questions, makeEmptyQuestion()] }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((prev) => {
      if (prev.questions.length <= 1) return prev;
      const questions = prev.questions.filter((_, idx) => idx !== questionIndex);
      return { ...prev, questions };
    });
  };

  const addOption = (questionIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const question = questions[questionIndex];
      if (!question) return prev;

      if (question.options.length >= 6) return prev;

      questions[questionIndex] = {
        ...question,
        options: [...question.options, ""],
      };
      return { ...prev, questions };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const question = questions[questionIndex];
      if (!question || question.options.length <= 2) return prev;

      const options = question.options.filter((_, idx) => idx !== optionIndex);
      let nextCorrect = Number(question.correctOptionIndex || 0);

      if (optionIndex === nextCorrect) nextCorrect = 0;
      if (optionIndex < nextCorrect) nextCorrect -= 1;

      questions[questionIndex] = {
        ...question,
        options,
        correctOptionIndex: Math.max(0, Math.min(nextCorrect, options.length - 1)),
      };

      return { ...prev, questions };
    });
  };

  const setOptionText = (questionIndex, optionIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const question = questions[questionIndex];
      if (!question) return prev;

      const options = [...question.options];
      options[optionIndex] = value;

      questions[questionIndex] = { ...question, options };
      return { ...prev, questions };
    });
  };

  const validationError = useMemo(() => {
    if (!form.title.trim()) return "Quiz title is required.";
    if (!Number.isInteger(Number(form.secondsPerQuestion)) || Number(form.secondsPerQuestion) < 5) {
      return "Timer must be at least 5 seconds per question.";
    }

    if (!Array.isArray(form.questions) || form.questions.length === 0) {
      return "At least one question is required.";
    }

    for (let i = 0; i < form.questions.length; i += 1) {
      const q = form.questions[i];
      if (!String(q?.prompt || "").trim()) {
        return `Question ${i + 1}: prompt is required.`;
      }

      if (!Array.isArray(q?.options) || q.options.length < 2) {
        return `Question ${i + 1}: at least two options are required.`;
      }

      const trimmedOptions = q.options.map((item) => String(item || "").trim());
      if (trimmedOptions.some((item) => !item)) {
        return `Question ${i + 1}: option text cannot be empty.`;
      }

      const correct = Number(q.correctOptionIndex);
      if (!Number.isInteger(correct) || correct < 0 || correct >= q.options.length) {
        return `Question ${i + 1}: select a valid correct option.`;
      }
    }

    return "";
  }, [form]);

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    secondsPerQuestion: Number(form.secondsPerQuestion || 30),
    isActive: Boolean(form.isActive),
    questions: form.questions.map((question) => ({
      prompt: String(question.prompt || "").trim(),
      options: question.options.map((item) => String(item || "").trim()),
      correctOptionIndex: Number(question.correctOptionIndex || 0),
    })),
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (isEdit) {
        const res = await updateQuiz(id, payload);
        setShareUrl(res?.data?.data?.shareUrl || shareUrl);
        setShareToken(res?.data?.data?.shareToken || shareToken);
        showToast("Quiz updated", "success");
        return;
      } else {
        const res = await createQuiz(payload);
        const quizId = res?.data?.data?._id;
        showToast("Quiz created", "success");
        if (quizId) {
          navigate(`/admin/quizzes/${quizId}`, { replace: true });
          return;
        }
        navigate("/admin/quizzes", { replace: true });
        return;
      }
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to save quiz", "error");
    } finally {
      setSaving(false);
    }
  };

  const onRegenerateLink = async () => {
    if (!isEdit) return;
    setRegenerating(true);
    try {
      const res = await regenerateQuizLink(id);
      const next = res?.data?.data?.shareUrl || "";
      const nextToken = res?.data?.data?.shareToken || "";
      setShareUrl(next);
      setShareToken(nextToken);
      showToast("Share link regenerated", "success");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to regenerate link", "error");
    } finally {
      setRegenerating(false);
    }
  };

  const copyLink = async () => {
    const nextShareUrl = resolveShareUrl(shareToken, shareUrl);
    try {
      if (!nextShareUrl) throw new Error("No link");
      await navigator.clipboard.writeText(nextShareUrl);
      showToast("Share link copied", "success");
    } catch {
      showToast("Unable to copy link", "error");
    }
  };

  const computedShareUrl = resolveShareUrl(shareToken, shareUrl);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-6 w-52 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/quizzes"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/85 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {isEdit ? "Edit Quiz" : "Create Quiz"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Add questions manually, set correct answers, and control question timer.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-semibold text-white/60">Quiz Title</span>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Example: JavaScript Fundamentals"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                required
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-semibold text-white/60">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                placeholder="Optional details shown to students before the test starts."
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Timer Per Question (seconds)</span>
              <input
                type="number"
                min={5}
                max={300}
                value={form.secondsPerQuestion}
                onChange={(e) => updateField("secondsPerQuestion", Number(e.target.value || 0))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Availability</span>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => updateField("isActive", e.target.value === "active")}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                           focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
              >
                <option value="active">Active (students can access)</option>
                <option value="inactive">Inactive (hidden)</option>
              </select>
            </label>
          </div>

          {isEdit && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-white/60">Share Link</div>
              <div className="mt-2 break-all text-sm text-white/80">{computedShareUrl || "-"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={onRegenerateLink}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition disabled:opacity-60"
                >
                  {regenerating ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {form.questions.map((question, qIndex) => (
              <div key={qIndex} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-white">Question {qIndex + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    disabled={form.questions.length <= 1}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200
                               hover:bg-rose-500/15 transition disabled:opacity-45"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <label className="mt-3 grid gap-2">
                  <span className="text-xs font-semibold text-white/60">Question Text</span>
                  <textarea
                    rows={2}
                    value={question.prompt}
                    onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                               focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                    placeholder="Write your question here..."
                    required
                  />
                </label>

                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-white/60">Options (select correct answer)</div>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={Number(question.correctOptionIndex) === optionIndex}
                          onChange={() => updateQuestion(qIndex, { correctOptionIndex: optionIndex })}
                          className="h-4 w-4 accent-sky-400"
                        />
                        <span className="text-xs text-white/60">Correct</span>
                      </label>

                      <input
                        value={option}
                        onChange={(e) => setOptionText(qIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none
                                   focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, optionIndex)}
                        disabled={question.options.length <= 2}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 transition disabled:opacity-40"
                        title="Remove option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    disabled={question.options.length >= 6}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-6 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Quiz"}
          </button>

          {validationError ? <div className="text-xs text-rose-200">{validationError}</div> : null}
        </div>
      </form>
    </div>
  );
}
