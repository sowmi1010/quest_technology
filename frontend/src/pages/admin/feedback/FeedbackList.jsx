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
  Building2,
  MessageSquare,
  Users,
} from "lucide-react";
import AdminToast from "../../../components/admin/common/AdminToast";
import ConfirmModal from "../../../components/admin/common/ConfirmModal";

import { resolveAssetUrl } from "../../../utils/apiConfig";

const FEEDBACK_STATUS_OPTIONS = ["NEW", "CONTACTED", "PLACED"];

function fmtDate(value) {
  try {
    return value ? new Date(value).toLocaleDateString("en-IN") : "-";
  } catch {
    return "-";
  }
}

function statusPill(status) {
  const s = String(status || "").toUpperCase();
  if (s === "NEW") return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (s === "CONTACTED") return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  if (s === "PLACED") return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  return "border-white/10 bg-white/5 text-white/80";
}

function Stars({ rating = 0, compact = false }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i + 1 <= r;
        return (
          <Star
            key={i}
            className={[
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
              active ? "fill-current text-amber-200" : "text-white/35",
            ].join(" ")}
          />
        );
      })}
      <span className="ml-1 text-xs font-semibold text-white/70">{r}/5</span>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, tone = "sky" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200/20 bg-emerald-500/10"
      : tone === "amber"
      ? "border-amber-200/20 bg-amber-500/10"
      : "border-sky-200/20 bg-sky-500/10";

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 text-white/80" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">{title}</div>
          <div className="text-base font-bold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value || "NEW"}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-sky-400/35 [&>option]:bg-slate-900"
    >
      {FEEDBACK_STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
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

  const stats = useMemo(() => {
    const total = rows.length;
    const placed = rows.filter((r) => String(r.status || "").toUpperCase() === "PLACED").length;
    const contacted = rows.filter((r) => String(r.status || "").toUpperCase() === "CONTACTED").length;
    const avgRating = total
      ? (rows.reduce((sum, row) => sum + Number(row.rating || 0), 0) / total).toFixed(1)
      : "0.0";

    return { total, placed, contacted, avgRating };
  }, [rows]);

  const onStatusChange = async (id, status) => {
    try {
      await updateFeedback(id, { status });
      showToast("Status updated", "success");
      setRows((prev) => prev.map((row) => (row._id === id ? { ...row, status } : row)));
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
      setRows((prev) => prev.filter((row) => row._id !== id));
      setConfirmDel({ open: false, id: "", name: "" });
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "", type: toast.type })}
      />

      <section className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Admin</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Feedback</h1>
            <p className="mt-1 text-sm text-white/65">Clear view to manage student testimonials and placement feedback.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/15"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              to="/admin/feedback/new"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Plus className="h-4 w-4" />
              Add Feedback
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total" value={stats.total} icon={Users} tone="sky" />
          <MetricCard title="Placed" value={stats.placed} icon={Building2} tone="emerald" />
          <MetricCard title="Contacted" value={stats.contacted} icon={MessageSquare} tone="amber" />
          <MetricCard title="Average Rating" value={`${stats.avgRating}/5`} icon={Star} tone="sky" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 backdrop-blur-xl sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <label className="lg:col-span-7">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Search</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5">
              <Search className="h-4 w-4 text-white/45" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, course, company or feedback"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/45 outline-none"
              />
            </span>
          </label>

          <label className="lg:col-span-3">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Status</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5">
              <Filter className="h-4 w-4 text-white/45" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none [&>option]:bg-slate-900"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="lg:col-span-2">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Sort</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none [&>option]:bg-slate-900"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </span>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 backdrop-blur-xl">
        {loading ? (
          <div className="p-6">
            <div className="grid gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/65">No feedback found.</div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm text-white/85">
                <thead className="sticky top-0 z-10 bg-slate-950/85 backdrop-blur-xl">
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Student</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Rating</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Feedback</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Company</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id} className="border-t border-white/10 align-top transition hover:bg-white/[0.04]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {r.imageUrl ? (
                            <img
                              src={resolveAssetUrl(r.imageUrl)}
                              alt={r.name}
                              className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold text-white/45">
                              NO
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">{r.name || "-"}</div>
                            <div className="mt-0.5 text-xs text-white/55">{r.course || "No course"}</div>
                            <div className="mt-0.5 text-xs text-white/45">{fmtDate(r.createdAt)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Stars rating={r.rating} />
                      </td>

                      <td className="px-4 py-3 max-w-[340px]">
                        <p className="line-clamp-3 leading-relaxed text-white/80">{r.feedback || "-"}</p>
                      </td>

                      <td className="px-4 py-3 text-white/85">{r.company || "-"}</td>

                      <td className="px-4 py-3 min-w-[180px]">
                        <div className="space-y-2">
                          <span className={["inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", statusPill(r.status)].join(" ")}>
                            {r.status || "NEW"}
                          </span>
                          <StatusSelect value={r.status} onChange={(next) => onStatusChange(r._id, next)} />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/admin/feedback/${r._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => askDelete(r._id, r.name)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/25 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/25"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filtered.map((r) => (
                <article key={r._id} className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {r.imageUrl ? (
                        <img
                          src={resolveAssetUrl(r.imageUrl)}
                          alt={r.name}
                          className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold text-white/45">
                          NO
                        </div>
                      )}

                      <div>
                        <div className="font-semibold text-white">{r.name || "-"}</div>
                        <div className="text-xs text-white/55">{r.course || "No course"}</div>
                        <div className="text-xs text-white/45">{fmtDate(r.createdAt)}</div>
                      </div>
                    </div>

                    <span className={["inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", statusPill(r.status)].join(" ")}>
                      {r.status || "NEW"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <Stars rating={r.rating} compact />
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">{r.feedback || "-"}</p>

                  <div className="mt-3 text-sm text-white/80">
                    Company: <span className="font-semibold text-white">{r.company || "-"}</span>
                  </div>

                  <div className="mt-3">
                    <StatusSelect value={r.status} onChange={(next) => onStatusChange(r._id, next)} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/admin/feedback/${r._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => askDelete(r._id, r.name)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/25 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

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
              for <span className="font-semibold text-white">{confirmDel.name}</span>
            </>
          ) : null}
          .
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDel({ open: false, id: "", name: "" })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Delete
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}
