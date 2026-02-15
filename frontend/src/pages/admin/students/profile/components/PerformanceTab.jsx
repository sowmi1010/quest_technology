import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createPerformanceUpdate,
  deletePerformanceUpdate,
  getStudentPerformanceUpdates,
  updatePerformanceUpdate,
} from "../../../../../services/performanceApi";
import {
  Activity,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  X,
  Pencil,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
];

function statusPillClass(status) {
  if (status === "COMPLETED") return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  if (status === "IN_PROGRESS") return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (status === "ON_HOLD") return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  return "border-white/10 bg-white/5 text-white/80";
}

function fmtDate(value) {
  try {
    return value ? new Date(value).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-bold text-white">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PerformanceTab({ studentId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDel, setConfirmDel] = useState({ open: false, id: "", toolName: "" });

  const [form, setForm] = useState({
    toolName: "",
    status: "IN_PROGRESS",
    startDate: "",
    endDate: "",
    performanceMessage: "",
  });

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
      const res = await getStudentPerformanceUpdates(studentId);
      setRows(res?.data?.data || []);
    } catch {
      setRows([]);
      showToast("Failed to load performance updates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const stats = useMemo(() => {
    const total = rows.length;
    const completed = rows.filter((x) => x.status === "COMPLETED").length;
    const inProgress = rows.filter((x) => x.status === "IN_PROGRESS").length;
    const onHold = rows.filter((x) => x.status === "ON_HOLD").length;
    return { total, completed, inProgress, onHold };
  }, [rows]);

  const resetForm = () => {
    setForm({
      toolName: "",
      status: "IN_PROGRESS",
      startDate: "",
      endDate: "",
      performanceMessage: "",
    });
    setEditingId("");
  };

  const canSave = useMemo(() => {
    if (busy) return false;
    if (!form.toolName.trim()) return false;
    if (form.startDate && form.endDate && form.endDate < form.startDate) return false;
    return true;
  }, [busy, form.toolName, form.startDate, form.endDate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    const basePayload = {
      toolName: form.toolName.trim(),
      status: form.status,
      performanceMessage: form.performanceMessage.trim(),
    };

    setBusy(true);
    try {
      if (editingId) {
        await updatePerformanceUpdate(editingId, {
          ...basePayload,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
        showToast("Performance update edited");
      } else {
        await createPerformanceUpdate({
          studentId,
          ...basePayload,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        });
        showToast("Performance update added");
      }

      resetForm();
      await load();
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to save performance update", "error");
    } finally {
      setBusy(false);
    }
  };

  const onEdit = (row) => {
    setEditingId(row._id);
    setForm({
      toolName: row.toolName || "",
      status: row.status || "IN_PROGRESS",
      startDate: toInputDate(row.startDate),
      endDate: toInputDate(row.endDate),
      performanceMessage: row.performanceMessage || "",
    });
  };

  const askDelete = (row) => {
    setConfirmDel({
      open: true,
      id: row._id,
      toolName: row.toolName || "",
    });
  };

  const doDelete = async () => {
    if (!confirmDel.id) return;

    setBusy(true);
    try {
      await deletePerformanceUpdate(confirmDel.id);
      setConfirmDel({ open: false, id: "", toolName: "" });
      showToast("Performance update deleted");
      await load();
    } catch {
      showToast("Failed to delete performance update", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            className="fixed right-4 top-4 z-50"
          >
            <div
              className={[
                "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl",
                toast.type === "success"
                  ? "border-emerald-200/40 bg-emerald-50/80 text-emerald-900"
                  : "border-rose-200/40 bg-rose-50/80 text-rose-900",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Activity className="h-6 w-6 text-white/75" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Performance Updates</h2>
            <p className="mt-1 text-sm text-white/60">
              Track tool progress, date range, and mentor feedback.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition active:scale-[0.98] disabled:opacity-60"
        >
          <RefreshCcw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SummaryCard title="Total" value={stats.total} tone="sky" />
        <SummaryCard title="Completed" value={stats.completed} tone="emerald" />
        <SummaryCard title="In Progress" value={stats.inProgress} tone="sky" />
        <SummaryCard title="On Hold" value={stats.onHold} tone="amber" />
      </div>

      <form onSubmit={onSubmit} className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold text-white/60">
          {editingId ? "Edit Performance Update" : "Add Performance Update"}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[1.5fr_220px_180px_180px_auto]">
          <input
            name="toolName"
            value={form.toolName}
            onChange={onChange}
            placeholder="Tool / Module name"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40"
          />

          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400/40"
          />

          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400/40"
          />

          <div className="flex gap-2">
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition"
              >
                Cancel
              </button>
            ) : null}

            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {editingId ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>

        <textarea
          name="performanceMessage"
          value={form.performanceMessage}
          onChange={onChange}
          rows={3}
          placeholder="Performance message / mentor update..."
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40"
        />

        {form.startDate && form.endDate && form.endDate < form.startDate ? (
          <p className="mt-2 text-xs font-semibold text-rose-300">
            End date cannot be earlier than start date.
          </p>
        ) : null}
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-5">
            <div className="grid gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5 text-white/70">No performance updates yet.</div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Created</th>
                  <th className="p-4 text-left font-semibold text-white/70">Tool</th>
                  <th className="p-4 text-left font-semibold text-white/70">Status</th>
                  <th className="p-4 text-left font-semibold text-white/70">Start</th>
                  <th className="p-4 text-left font-semibold text-white/70">End</th>
                  <th className="p-4 text-left font-semibold text-white/70">Message</th>
                  <th className="p-4 text-left font-semibold text-white/70">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-4 text-white/80">{fmtDate(row.createdAt)}</td>
                    <td className="p-4 font-extrabold text-white">{row.toolName}</td>
                    <td className="p-4">
                      <span
                        className={[
                          "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold",
                          statusPillClass(row.status),
                        ].join(" ")}
                      >
                        {row.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-white/80">{fmtDate(row.startDate)}</td>
                    <td className="p-4 text-white/80">{fmtDate(row.endDate)}</td>
                    <td className="p-4 text-white/75 max-w-[420px]">{row.performanceMessage || "-"}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/85 hover:bg-white/10 transition"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => askDelete(row)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200 hover:bg-rose-500/15 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={confirmDel.open}
        title="Delete performance update?"
        onClose={() => setConfirmDel({ open: false, id: "", toolName: "" })}
      >
        <div className="text-sm text-white/70">
          This will permanently remove update for{" "}
          <span className="font-bold text-white">{confirmDel.toolName || "this tool"}</span>.
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDel({ open: false, id: "", toolName: "" })}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-2xl bg-rose-500/85 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ title, value, tone }) {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-200/20 bg-emerald-500/10"
      : tone === "amber"
      ? "border-amber-200/20 bg-amber-500/10"
      : "border-sky-200/20 bg-sky-500/10";

  return (
    <div className={`rounded-2xl border ${toneCls} p-4`}>
      <div className="text-xs font-semibold text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}
