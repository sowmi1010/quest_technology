import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteFeedback, listFeedback, updateFeedback } from "../../../services/feedbackApi";
import {
  Plus,
  RefreshCcw,
  Search,
  Filter,
  Trash2,
  Pencil,
  Star,
} from "lucide-react";
import AdminToast from "../../../components/admin/common/AdminToast";
import ConfirmModal from "../../../components/admin/common/ConfirmModal";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

function fmtDate(d) {
  try {
    return d ? new Date(d).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("new")) return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (s.includes("contact")) return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  if (s.includes("plac")) return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  return "border-white/10 bg-white/5 text-white/80";
}

function Stars({ rating = 0 }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i + 1 <= r;
        return (
          <Star
            key={i}
            className={[
              "h-4 w-4",
              active ? "text-amber-200 fill-current" : "text-white/35",
            ].join(" ")}
          />
        );
      })}
      <span className="ml-1 text-xs font-bold text-white/70">{r}/5</span>
    </div>
  );
}

export default function FeedbackList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDel, setConfirmDel] = useState({ open: false, id: "", name: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, message: "", type }),
      2200
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await listFeedback();
      setRows(res?.data?.data || []);
    } catch {
      setRows([]);
      showToast("Failed to load feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const uniqueStatuses = useMemo(() => {
    const set = new Set(rows.map((r) => String(r.status || "").trim()).filter(Boolean));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = !q
      ? rows
      : rows.filter((r) => {
          const line = `${r.name || ""} ${r.course || ""} ${r.company || ""} ${r.feedback || ""}`.toLowerCase();
          return line.includes(q);
        });

    if (statusFilter !== "all") {
      list = list.filter((r) => String(r.status || "") === statusFilter);
    }

    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortBy === "latest" ? db - da : da - db;
    });

    return list;
  }, [rows, query, statusFilter, sortBy]);

  const onStatusChange = async (id, status) => {
    try {
      await updateFeedback(id, { status });
      showToast("Status updated", "success");
      await load();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const askDelete = (id, name) => setConfirmDel({ open: true, id, name });

  const doDelete = async () => {
    const id = confirmDel.id;
    if (!id) return;

    try {
      await deleteFeedback(id);
      showToast("Deleted successfully", "success");
      setConfirmDel({ open: false, id: "", name: "" });
      await load();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "", type: toast.type })}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Feedback</h1>
          <p className="mt-1 text-sm text-white/60">Manage student feedback & placements.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98]"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </button>

          <Link
            to="/admin/feedback/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add Feedback
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_240px_180px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name / course / company / feedback..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 pl-12 pr-10 py-3 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
            >
              <option value="all">Status: All</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                       focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6">
            <div className="h-5 w-48 rounded bg-white/10 animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Date</th>
                  <th className="p-4 text-left font-semibold text-white/70">Image</th>
                  <th className="p-4 text-left font-semibold text-white/70">Name</th>
                  <th className="p-4 text-left font-semibold text-white/70">Course</th>
                  <th className="p-4 text-left font-semibold text-white/70">Rating</th>
                  <th className="p-4 text-left font-semibold text-white/70">Feedback</th>
                  <th className="p-4 text-left font-semibold text-white/70">Company</th>
                  <th className="p-4 text-left font-semibold text-white/70">Status</th>
                  <th className="p-4 text-left font-semibold text-white/70">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-t border-white/10 hover:bg-white/5 transition align-top">
                    <td className="p-4 text-white/80">{fmtDate(r.createdAt)}</td>

                    <td className="p-4">
                      {r.imageUrl ? (
                        <img
                          src={`${API_URL}${r.imageUrl}`}
                          alt={r.name}
                          className="h-10 w-10 rounded-2xl object-cover border border-white/10"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center text-[11px] text-white/50">
                          No
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-xs text-white/45">{r._id}</div>
                    </td>

                    <td className="p-4">{r.course || "-"}</td>

                    <td className="p-4">
                      <Stars rating={r.rating} />
                    </td>

                    <td className="p-4 max-w-[420px]">
                      <div className="text-white/80 leading-relaxed line-clamp-3">{r.feedback}</div>
                    </td>

                    <td className="p-4">{r.company || "-"}</td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={[
                            "inline-flex w-fit rounded-2xl border px-3 py-1.5 text-xs font-bold",
                            statusPill(r.status),
                          ].join(" ")}
                        >
                          {r.status || "Unknown"}
                        </span>

                        <select
                          value={r.status}
                          onChange={(e) => onStatusChange(r._id, e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none
                                     focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="PLACED">PLACED</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/feedback/${r._id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/85
                                     hover:bg-white/10 transition active:scale-[0.98]"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => askDelete(r._id, r.name)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200
                                     hover:bg-rose-500/15 transition active:scale-[0.98]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-white/60">
                      No feedback found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        open={confirmDel.open}
        title="Delete feedback?"
        onClose={() => setConfirmDel({ open: false, id: "", name: "" })}
      >
        <div className="text-sm text-white/70">
          This will permanently delete feedback
          {confirmDel.name ? (
            <>
              {" "}
              for <span className="font-bold text-white">{confirmDel.name}</span>
            </>
          ) : null}
          .
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDel({ open: false, id: "", name: "" })}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-2xl bg-rose-500/85 px-4 py-3 text-sm font-bold text-white
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}

