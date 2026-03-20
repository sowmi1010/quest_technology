import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCcw, Search, Trash2 } from "lucide-react";

import AdminToast from "../../../components/admin/common/AdminToast";
import ConfirmModal from "../../../components/admin/common/ConfirmModal";
import { deleteQuizAttempt, listQuizAttempts } from "../../../services/quizApi";

function fmtDate(value) {
  try {
    return value ? new Date(value).toLocaleString() : "-";
  } catch {
    return "-";
  }
}

function statusPill(status = "") {
  const key = String(status).toUpperCase();
  if (key === "SUBMITTED") return "border-emerald-300/25 bg-emerald-500/15 text-emerald-200";
  if (key === "AUTO_SUBMITTED") return "border-amber-300/25 bg-amber-500/15 text-amber-200";
  return "border-sky-300/25 bg-sky-500/15 text-sky-200";
}

export default function QuizAttempts() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    registrations: 0,
    submissions: 0,
    avgScore: 0,
    highestScore: 0,
  });
  const [quiz, setQuiz] = useState({ title: "" });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState("");
  const [confirmDel, setConfirmDel] = useState({
    open: false,
    attemptId: "",
    studentName: "",
    phoneNumber: "",
  });

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, type, message: "" }),
      2200
    );
  };

  const load = async (nextPage = page, q = query) => {
    setLoading(true);
    try {
      const res = await listQuizAttempts(id, { page: nextPage, q: q.trim() });
      setRows(res?.data?.data || []);
      setQuiz(res?.data?.quiz || { title: "" });
      setStats(
        res?.data?.stats || {
          registrations: 0,
          submissions: 0,
          avgScore: 0,
          highestScore: 0,
        }
      );
      setPagination(res?.data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      setRows([]);
      showToast(error?.response?.data?.message || "Failed to load results", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, query);
  }, [id, page]);

  const onSearch = async (event) => {
    event.preventDefault();
    setPage(1);
    await load(1, query);
  };

  const askDelete = (row) => {
    setConfirmDel({
      open: true,
      attemptId: row._id,
      studentName: row.studentName || "",
      phoneNumber: row.phoneNumber || "",
    });
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setConfirmDel({ open: false, attemptId: "", studentName: "", phoneNumber: "" });
  };

  const doDelete = async () => {
    if (!confirmDel.attemptId || deletingId) return;

    setDeletingId(confirmDel.attemptId);
    try {
      await deleteQuizAttempt(id, confirmDel.attemptId);
      showToast("Quiz result deleted", "success");
      setConfirmDel({ open: false, attemptId: "", studentName: "", phoneNumber: "" });
      await load(page, query);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to delete result", "error");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
           
            <h1 className="text-xl sm:text-2xl font-bold text-white">Quiz Results</h1>
          </div>
          <p className="mt-2 text-sm text-white/60">{quiz.title || "Quiz"}: registrations and scores</p>
        </div>

        <button
          type="button"
          onClick={() => load(page, query)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition"
        >
          <RefreshCcw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/60">Registrations</div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.registrations || 0}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/60">Submissions</div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.submissions || 0}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/60">Average Score</div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.avgScore || 0}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/60">Highest Score</div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.highestScore || 0}</div>
        </div>
      </div>

      <form
        onSubmit={onSearch}
        className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name / department / phone..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="max-h-[68vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Student</th>
                  <th className="p-4 text-left font-semibold text-white/70">Department</th>
                  <th className="p-4 text-left font-semibold text-white/70">Phone</th>
                  <th className="p-4 text-left font-semibold text-white/70">Status</th>
                  <th className="p-4 text-left font-semibold text-white/70">Score</th>
                  <th className="p-4 text-left font-semibold text-white/70">Answered</th>
                  <th className="p-4 text-left font-semibold text-white/70">Started</th>
                  <th className="p-4 text-left font-semibold text-white/70">Submitted</th>
                  <th className="p-4 text-left font-semibold text-white/70">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{row.studentName || "-"}</div>
                    </td>
                    <td className="p-4">{row.department || "-"}</td>
                    <td className="p-4">{row.phoneNumber || "-"}</td>
                    <td className="p-4">
                      <span
                        className={[
                          "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold",
                          statusPill(row.status),
                        ].join(" ")}
                      >
                        {row.status || "IN_PROGRESS"}
                      </span>
                    </td>
                    <td className="p-4">
                      {row.score || 0} / {row.totalQuestions || 0}
                    </td>
                    <td className="p-4">{row.answeredCount || 0}</td>
                    <td className="p-4 text-white/70">{fmtDate(row.startedAt)}</td>
                    <td className="p-4 text-white/70">{fmtDate(row.submittedAt)}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => askDelete(row)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/15 transition disabled:opacity-60"
                        disabled={Boolean(deletingId)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-white/60">
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDel.open}
        title="Delete quiz result?"
        onClose={closeDeleteModal}
      >
        <div className="text-sm text-white/70">
          This will permanently remove this student result from the quiz report.
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Student</span>
            <span className="font-bold text-white">{confirmDel.studentName || "-"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/60">Phone</span>
            <span className="font-bold text-white">{confirmDel.phoneNumber || "-"}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 disabled:opacity-60"
            disabled={Boolean(deletingId)}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-2xl bg-rose-500/85 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            disabled={Boolean(deletingId)}
          >
            {deletingId ? "Deleting..." : "Delete"}
          </button>
        </div>
      </ConfirmModal>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-white/55">
          Page {pagination.page || 1} of {pagination.totalPages || 1}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={(pagination.page || 1) <= 1}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition disabled:opacity-45"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(Number(pagination.totalPages || 1), prev + 1))}
            disabled={(pagination.page || 1) >= Number(pagination.totalPages || 1)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
