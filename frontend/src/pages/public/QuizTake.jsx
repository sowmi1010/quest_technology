import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock3, LoaderCircle } from "lucide-react";

import AdminToast from "../../components/admin/common/AdminToast";
import {
  getCurrentQuizQuestion,
  getPublicQuiz,
  registerQuizAttempt,
  submitQuizAnswer,
} from "../../services/quizApi";

const ATTEMPT_STORAGE_PREFIX = "quest_quiz_attempt_";

function formatTimer(ms) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function toStorageKey(shareToken = "") {
  return `${ATTEMPT_STORAGE_PREFIX}${String(shareToken || "").trim()}`;
}

function calcRemainingMs(windowEndsAt = "") {
  if (!windowEndsAt) return 0;
  const deadline = new Date(windowEndsAt).getTime();
  if (!Number.isFinite(deadline)) return 0;
  return Math.max(0, deadline - Date.now());
}

function getStoredAttemptToken(shareToken = "") {
  if (typeof window === "undefined") return "";
  try {
    return String(window.sessionStorage.getItem(toStorageKey(shareToken)) || "").trim();
  } catch {
    return "";
  }
}

function setStoredAttemptToken(shareToken = "", token = "") {
  if (typeof window === "undefined") return;
  try {
    const key = toStorageKey(shareToken);
    if (String(token || "").trim()) {
      window.sessionStorage.setItem(key, String(token).trim());
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage issues
  }
}

export default function QuizTake() {
  const { id } = useParams();
  const shareToken = String(id || "").trim();

  const [phase, setPhase] = useState("loading"); // loading | register | question | result | error
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    questionCount: 0,
    secondsPerQuestion: 30,
  });

  const [registration, setRegistration] = useState({
    studentName: "",
    department: "",
    phoneNumber: "",
  });

  const [attemptToken, setAttemptToken] = useState("");
  const [current, setCurrent] = useState(null);
  const [progress, setProgress] = useState({ answeredCount: 0, totalQuestions: 0 });
  const [result, setResult] = useState(null);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [selectionLocked, setSelectionLocked] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [timeoutHandledForQuestion, setTimeoutHandledForQuestion] = useState(null);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, type, message: "" }),
      2200
    );
  };

  const resetQuestionInteraction = () => {
    setSelectedOptionIndex(null);
    setSelectionLocked(false);
    setTimeoutHandledForQuestion(null);
  };

  const applyQuestionState = (payload = {}) => {
    const nextCurrent = payload.current || null;
    setCurrent(nextCurrent);
    setRemainingMs(calcRemainingMs(nextCurrent?.windowEndsAt));
    setProgress(payload.progress || { answeredCount: 0, totalQuestions: 0 });
    resetQuestionInteraction();
    setPhase(payload.completed ? "result" : "question");
  };

  const applyResultState = (payload = {}) => {
    setResult(payload.result || null);
    setCurrent(null);
    setRemainingMs(0);
    setPhase("result");
  };

  const bootstrap = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const publicRes = await getPublicQuiz(shareToken);
      const quizInfo = publicRes?.data?.data || {};
      setQuiz({
        title: quizInfo.title || "",
        description: quizInfo.description || "",
        questionCount: Number(quizInfo.questionCount || 0),
        secondsPerQuestion: Number(quizInfo.secondsPerQuestion || 30),
      });

      const storedToken = getStoredAttemptToken(shareToken);
      if (!storedToken) {
        setPhase("register");
        setLoading(false);
        return;
      }

      try {
        const currentRes = await getCurrentQuizQuestion(storedToken);
        const data = currentRes?.data?.data || {};
        setAttemptToken(storedToken);

        if (data.completed) {
          applyResultState(data);
          setStoredAttemptToken(shareToken, "");
        } else {
          applyQuestionState(data);
        }
      } catch {
        setStoredAttemptToken(shareToken, "");
        setPhase("register");
      }
    } catch (error) {
      setPhase("error");
      setErrorMessage(error?.response?.data?.message || "Quiz link is invalid or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, [shareToken]);

  useEffect(() => {
    if (phase !== "question" || !current?.windowEndsAt) return undefined;

    const tick = () => {
      setRemainingMs(calcRemainingMs(current.windowEndsAt));
    };

    tick();
    const timerId = window.setInterval(tick, 200);
    return () => window.clearInterval(timerId);
  }, [phase, current?.windowEndsAt, current?.questionIndex]);

  const submitCurrentQuestion = async ({ timedOut = false } = {}) => {
    if (!attemptToken || !current || submitting) return;

    if (!timedOut && selectedOptionIndex === null) {
      showToast("Select an option before moving to next question.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        questionIndex: current.questionIndex,
        selectedOptionIndex,
        timedOut,
      };

      const res = await submitQuizAnswer(attemptToken, payload);
      const data = res?.data?.data || {};

      if (data.completed) {
        applyResultState(data);
        setStoredAttemptToken(shareToken, "");
        return;
      }

      applyQuestionState(data);
    } catch (error) {
      const currentFromServer = error?.response?.data?.data?.current;
      if (currentFromServer) {
        setCurrent(currentFromServer);
        setRemainingMs(calcRemainingMs(currentFromServer?.windowEndsAt));
        resetQuestionInteraction();
        showToast("Question locked. Loaded latest question.", "error");
      } else {
        showToast(error?.response?.data?.message || "Failed to submit answer", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (phase !== "question" || !current) return;
    const deadlineMs = new Date(current.windowEndsAt || "").getTime();
    if (!Number.isFinite(deadlineMs)) return;
    if (Date.now() < deadlineMs) return;
    if (remainingMs > 0) return;
    if (submitting) return;
    if (timeoutHandledForQuestion === current.questionIndex) return;

    setTimeoutHandledForQuestion(current.questionIndex);
    submitCurrentQuestion({ timedOut: true });
  }, [phase, remainingMs, submitting, timeoutHandledForQuestion, current?.questionIndex]);

  const onRegister = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!registration.studentName.trim() || !registration.department.trim() || !registration.phoneNumber.trim()) {
      showToast("All registration fields are required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerQuizAttempt(shareToken, {
        studentName: registration.studentName.trim(),
        department: registration.department.trim(),
        phoneNumber: registration.phoneNumber.trim(),
      });

      const data = res?.data?.data || {};
      const token = String(data.attemptToken || "").trim();
      if (!token) throw new Error("Missing attempt token");

      setAttemptToken(token);
      setStoredAttemptToken(shareToken, token);

      if (data.completed) {
        applyResultState(data);
        setStoredAttemptToken(shareToken, "");
        return;
      }

      if (data.quiz) {
        setQuiz((prev) => ({
          ...prev,
          title: data.quiz.title || prev.title,
          description: data.quiz.description || prev.description,
          questionCount: Number(data.quiz.questionCount || prev.questionCount || 0),
          secondsPerQuestion: Number(data.quiz.secondsPerQuestion || prev.secondsPerQuestion || 30),
        }));
      }

      applyQuestionState(data);
      showToast("Registration successful. Test started.", "success");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to start quiz", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const progressLabel = useMemo(() => {
    if (!progress?.totalQuestions) return "0 / 0";
    const answered = Number(progress?.answeredCount || 0);
    const total = Number(progress?.totalQuestions || 0);
    return `${Math.min(answered + 1, total)} / ${total}`;
  }, [progress]);

  const timerLabel = formatTimer(remainingMs);

  if (loading || phase === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin text-sky-300" />
            <div className="text-sm text-white/80">Loading quiz...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(20,184,166,0.2),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(2,6,23,0.94))] px-4 py-8 text-white">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{quiz.title || "Quiz"}</h1>
            <Link
              to="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition"
            >
              Exit
            </Link>
          </div>

          {quiz.description ? <p className="mb-6 text-sm text-white/70">{quiz.description}</p> : null}

          {phase === "error" ? (
            <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              {errorMessage || "Quiz is not available right now."}
            </div>
          ) : null}

          {phase === "register" ? (
            <form onSubmit={onRegister} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                <div>Questions: {quiz.questionCount || 0}</div>
                <div>Timer: {quiz.secondsPerQuestion || 30} seconds per question</div>
                <div>Once you select an option, it cannot be changed.</div>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-semibold text-white/60">Student Name</span>
                <input
                  value={registration.studentName}
                  onChange={(e) => setRegistration((prev) => ({ ...prev, studentName: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold text-white/60">Department</span>
                <input
                  value={registration.department}
                  onChange={(e) => setRegistration((prev) => ({ ...prev, department: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                  placeholder="Enter your department"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold text-white/60">Phone Number</span>
                <input
                  value={registration.phoneNumber}
                  onChange={(e) => setRegistration((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                  placeholder="Enter your phone number"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                           shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? "Starting..." : "Start Test"}
              </button>
            </form>
          ) : null}

          {phase === "question" && current ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs font-semibold text-white/70">
                  Question {progressLabel}
                </div>
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm font-bold",
                    remainingMs <= 5000
                      ? "border-rose-300/30 bg-rose-500/15 text-rose-100"
                      : "border-sky-300/30 bg-sky-500/15 text-sky-100",
                  ].join(" ")}
                >
                  <Clock3 className="h-4 w-4" />
                  {timerLabel}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {current.prompt}
                </div>
              </div>

              <div className="space-y-2">
                {Array.isArray(current.options)
                  ? current.options.map((option, index) => {
                      const selected = selectedOptionIndex === index;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (selectionLocked) return;
                            setSelectedOptionIndex(index);
                            setSelectionLocked(true);
                          }}
                          disabled={selectionLocked && !selected}
                          className={[
                            "w-full text-left rounded-2xl border px-4 py-3 text-sm transition",
                            selected
                              ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
                              : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
                            selectionLocked && !selected ? "opacity-55 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </button>
                      );
                    })
                  : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-white/60">
                  {selectionLocked
                    ? "Answer locked. Click Next."
                    : "Choose one option. You cannot change it after selection."}
                </div>

                <button
                  type="button"
                  onClick={() => submitCurrentQuestion({ timedOut: false })}
                  disabled={submitting || selectedOptionIndex === null}
                  className="rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                             shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Next"}
                </button>
              </div>
            </div>
          ) : null}

          {phase === "result" && result ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-5">
                <h2 className="text-lg font-bold text-emerald-100">Quiz Completed</h2>
                <p className="mt-2 text-sm text-emerald-100/90">
                  {result.studentName}, your submission has been recorded successfully.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Score</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {result.score || 0} / {result.totalQuestions || 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Correct Answers</div>
                  <div className="mt-2 text-2xl font-bold text-white">{result.correctAnswers || 0}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

