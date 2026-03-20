import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Copy,
  Eye,
  Link2,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldOff,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";

import AdminToast from "../../../components/admin/common/AdminToast";
import ConfirmModal from "../../../components/admin/common/ConfirmModal";
import { deleteQuiz, listQuizzes, regenerateQuizLink } from "../../../services/quizApi";

const SITE_URL = String(import.meta.env.VITE_SITE_URL || "").trim().replace(/\/+$/, "");

function fmtDate(value) {
  try {
    return value ? new Date(value).toLocaleString() : "-";
  } catch {
    return "-";
  }
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

function statusPill(active) {
  return active
    ? "border-emerald-300/25 bg-emerald-500/15 text-emerald-100"
    : "border-rose-300/25 bg-rose-500/15 text-rose-100";
}

export default function QuizList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: "", title: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, type, message: "" }),
      2200
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await listQuizzes();
      setRows(res?.data?.data || []);
    } catch (error) {
      setRows([]);
      showToast(error?.response?.data?.message || "Failed to load quizzes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const updated = params.get("updated");
    const created = params.get("created");

    if (updated === "1") {
      showToast("Quiz updated successfully", "success");
      navigate("/admin/quizzes", { replace: true });
      return;
    }

    if (created === "1") {
      showToast("Quiz created successfully", "success");
      navigate("/admin/quizzes", { replace: true });
    }
  }, [location.search, navigate]);

  const summary = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((item) => item?.isActive).length;
    const registrations = rows.reduce((sum, item) => sum + Number(item?.stats?.registrations || 0), 0);
    const highestScore = rows.reduce(
      (max, item) => Math.max(max, Number(item?.stats?.highestScore || 0)),
      0
    );

    return {
      total,
      active,
      inactive: Math.max(0, total - active),
      registrations,
      highestScore,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? rows.filter((row) =>
          `${row.title || ""} ${row.description || ""} ${row.shareToken || ""}`
            .toLowerCase()
            .includes(q)
        )
      : [...rows];

    if (statusFilter === "active") {
      list = list.filter((row) => Boolean(row?.isActive));
    }
    if (statusFilter === "inactive") {
      list = list.filter((row) => !row?.isActive);
    }

    list.sort((a, b) => {
      if (sortBy === "title") {
        return String(a?.title || "").localeCompare(String(b?.title || ""));
      }
      if (sortBy === "registrations") {
        return Number(b?.stats?.registrations || 0) - Number(a?.stats?.registrations || 0);
      }
      if (sortBy === "score") {
        return Number(b?.stats?.avgScore || 0) - Number(a?.stats?.avgScore || 0);
      }

      return new Date(b?.updatedAt || 0).getTime() - new Date(a?.updatedAt || 0).getTime();
    });

    return list;
  }, [rows, query, statusFilter, sortBy]);

  const copyShareLink = async (url) => {
    try {
      if (!url) throw new Error("Invalid link");
      await navigator.clipboard.writeText(url);
      showToast("Share link copied", "success");
    } catch {
      showToast("Unable to copy link", "error");
    }
  };

  const onRegenerateLink = async (id) => {
    try {
      await regenerateQuizLink(id);
      await load();
      showToast("Share link regenerated", "success");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to regenerate link", "error");
    }
  };

  const onDeleteQuiz = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteQuiz(confirmDelete.id);
      setConfirmDelete({ open: false, id: "", title: "" });
      showToast("Quiz deleted", "success");
      await load();
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to delete quiz", "error");
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

      <div className="rounded-3xl border border-sky-300/15 bg-[linear-gradient(120deg,rgba(14,165,233,0.14),rgba(34,197,94,0.08),rgba(99,102,241,0.12))] p-5 sm:p-6 shadow-[0_28px_70px_-50px_rgba(56,189,248,0.65)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-100">
              <Sparkles className="h-4 w-4" />
              Quiz Workspace
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Quizzes
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Create quizzes, share links, and monitor student scores.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/90 hover:bg-white/15 transition"
            >
              <RefreshCcw className="h-5 w-5" />
              Refresh
            </button>

            <Link
              to="/admin/quizzes/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/90 px-5 py-3 text-sm font-bold text-slate-950
                         shadow-[0_18px_45px_-25px_rgba(34,211,238,0.85)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Create Quiz
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
            <div className="text-xs font-semibold text-white/60">Total Quizzes</div>
            <div className="mt-2 text-2xl font-black text-white">{summary.total}</div>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-emerald-100/80">Active</div>
              <BadgeCheck className="h-4 w-4 text-emerald-200" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-100">{summary.active}</div>
          </div>
          <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-rose-100/80">Inactive</div>
              <ShieldOff className="h-4 w-4 text-rose-200" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-100">{summary.inactive}</div>
          </div>
          <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-sky-100/80">Registrations</div>
              <Users className="h-4 w-4 text-sky-100" />
            </div>
            <div className="mt-2 text-2xl font-black text-sky-100">{summary.registrations}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quiz title / description / token..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-cyan-300/40 focus:border-cyan-300/30 transition"
            />
          </div>

          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/30 p-1">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={[
                  "rounded-xl px-3 py-2 text-xs font-semibold transition",
                  statusFilter === item.id
                    ? "bg-white/15 text-white"
                    : "text-white/65 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/35 pl-10 pr-8 py-3 text-sm text-white outline-none
                         focus:ring-2 focus:ring-cyan-300/40 [&>option]:bg-white [&>option]:text-slate-900"
            >
              <option value="updated">Sort: Last Updated</option>
              <option value="registrations">Sort: Registrations</option>
              <option value="score">Sort: Avg Score</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            <div className="hidden max-h-[72vh] overflow-auto p-4 lg:block">
              <div className="space-y-3">
                {filtered.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
                    No quizzes found.
                  </div>
                )}

                {filtered.map((row) => {
                  const shareUrl = resolveShareUrl(row.shareToken, row.shareUrl);
                  return (
                    <article
                      key={row._id}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition hover:border-cyan-300/20 hover:bg-cyan-500/[0.05]"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-bold text-white">
                              {row.title || "Untitled Quiz"}
                            </h3>
                            <span
                              className={[
                                "inline-flex rounded-2xl border px-3 py-1 text-[11px] font-bold",
                                statusPill(row.isActive),
                              ].join(" ")}
                            >
                              {row.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-white/55 line-clamp-1">
                            {row.description || "No description"}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-white/85">
                              Q: <span className="font-bold text-white">{row.questionCount || 0}</span>
                            </span>
                            <span className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-white/85">
                              Timer:{" "}
                              <span className="font-bold text-white">{row.secondsPerQuestion || 30}s</span>
                            </span>
                            <span className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-white/85">
                              Reg: <span className="font-bold text-white">{row?.stats?.registrations || 0}</span>
                            </span>
                            <span className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-white/85">
                              Avg: <span className="font-bold text-white">{row?.stats?.avgScore || 0}</span>
                            </span>
                            <span className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-white/75">
                              Updated: {fmtDate(row.updatedAt)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                            <Link2 className="h-4 w-4 shrink-0 text-white/45" />
                            <div className="truncate text-xs text-white/70">{shareUrl || "-"}</div>
                            <button
                              type="button"
                              onClick={() => copyShareLink(shareUrl)}
                              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/15 transition"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/admin/quizzes/${row._id}/attempts`}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-300/25 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20 transition"
                          >
                            <Eye className="h-4 w-4" />
                            Results
                          </Link>
                          <Link
                            to={`/admin/quizzes/${row._id}`}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/15 transition"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => onRegenerateLink(row._id)}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/15 transition"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Regen
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ open: true, id: row._id, title: row.title })}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-300/25 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 p-3 lg:hidden">
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/60">
                  No quizzes found.
                </div>
              )}

              {filtered.map((row) => {
                const shareUrl = resolveShareUrl(row.shareToken, row.shareUrl);
                return (
                  <div
                    key={row._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.8)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-white">{row.title || "Untitled Quiz"}</div>
                        <div className="mt-1 text-xs text-white/55 line-clamp-2">
                          {row.description || "No description"}
                        </div>
                      </div>
                      <span
                        className={[
                          "inline-flex rounded-2xl border px-3 py-1 text-[11px] font-bold",
                          statusPill(row.isActive),
                        ].join(" ")}
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/75">
                        Questions: <span className="font-bold text-white">{row.questionCount || 0}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/75">
                        Timer:{" "}
                        <span className="font-bold text-white">{row.secondsPerQuestion || 30}s</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/75">
                        Registrations:{" "}
                        <span className="font-bold text-white">{row?.stats?.registrations || 0}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/75">
                        Avg Score: <span className="font-bold text-white">{row?.stats?.avgScore || 0}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <Link2 className="h-4 w-4 shrink-0 text-white/45" />
                      <div className="truncate text-xs text-white/70">{shareUrl || "-"}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyShareLink(shareUrl)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/15 transition"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => onRegenerateLink(row._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/15 transition"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Regen
                      </button>
                      <Link
                        to={`/admin/quizzes/${row._id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/15 transition"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                      <Link
                        to={`/admin/quizzes/${row._id}/attempts`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/25 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20 transition"
                      >
                        <Eye className="h-4 w-4" />
                        Results
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ open: true, id: row._id, title: row.title })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/25 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>

                    <div className="mt-3 text-[11px] text-white/50">Updated: {fmtDate(row.updatedAt)}</div>
                  </div>
                );
              })}
            </div>

            {filtered.length > 0 && (
              <div className="border-t border-white/10 bg-slate-950/30 px-4 py-3 text-xs text-white/60">
                Showing <span className="font-semibold text-white/85">{filtered.length}</span> quizzes.
                Highest recorded score:{" "}
                <span className="inline-flex items-center gap-1 font-semibold text-amber-100">
                  <Trophy className="h-3.5 w-3.5" />
                  {summary.highestScore}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete.open}
        title="Delete quiz?"
        onClose={() => setConfirmDelete({ open: false, id: "", title: "" })}
      >
        <div className="text-sm text-white/70">
          This will remove quiz
          {confirmDelete.title ? (
            <>
              {" "}
              <span className="font-bold text-white">{confirmDelete.title}</span>
            </>
          ) : null}
          , including all registrations and results.
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete({ open: false, id: "", title: "" })}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDeleteQuiz}
            className="flex-1 rounded-2xl bg-rose-500/85 px-4 py-3 text-sm font-bold text-white hover:brightness-110 transition"
          >
            Delete
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}

