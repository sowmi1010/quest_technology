import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  generateSchedule,
  getSchedule,
  payInstallment,
} from "../../../../../services/paymentScheduleApi";
import {
  RefreshCcw,
  WalletCards,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

function fmtDate(d) {
  try {
    return d ? new Date(d).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function iso(d) {
  try {
    return d ? new Date(d).toISOString().slice(0, 10) : "";
  } catch {
    return "";
  }
}

function badgeClass(status, overdue) {
  if (status === "PAID")
    return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  if (overdue)
    return "border-rose-200/30 bg-rose-500/15 text-rose-200";
  return "border-amber-200/30 bg-amber-500/15 text-amber-200";
}

function MethodIcon({ method }) {
  const m = String(method || "").toLowerCase();
  if (m === "upi" || m === "online") return <Smartphone className="h-4 w-4" />;
  if (m === "card") return <CreditCard className="h-4 w-4" />;
  if (m === "bank") return <Landmark className="h-4 w-4" />;
  return <Banknote className="h-4 w-4" />;
}

export default function InstallmentScheduleTab({ studentId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState("Cash");
  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmPay, setConfirmPay] = useState({ open: false, id: "", no: "", amount: 0, due: "" });

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
      const res = await getSchedule(studentId);
      setRows(res?.data?.data || []);
    } catch {
      setRows([]);
      showToast("Failed to load schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const computed = useMemo(() => {
    const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const paid = rows
      .filter((r) => r.status === "PAID")
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const due = total - paid;

    const dueRows = rows
      .filter((r) => r.status === "DUE")
      .slice()
      .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));

    const nextDue = dueRows.length ? dueRows[0] : null;

    return { total, paid, due, nextDue };
  }, [rows]);

  const onGenerate = async () => {
    setBusy(true);
    try {
      await generateSchedule(studentId);
      showToast("Schedule generated", "success");
      await load();
    } catch {
      showToast("Failed to generate schedule", "error");
    } finally {
      setBusy(false);
    }
  };

  const askPay = (r) => {
    setConfirmPay({
      open: true,
      id: r._id,
      no: r.installmentNo,
      amount: Number(r.amount) || 0,
      due: r.dueDate || "",
    });
  };

  const doPay = async () => {
    const id = confirmPay.id;
    if (!id) return;

    setBusy(true);
    try {
      await payInstallment(id, { method });
      showToast("Installment marked as paid", "success");
      setConfirmPay({ open: false, id: "", no: "", amount: 0, due: "" });
      await load();
    } catch {
      showToast("Payment update failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <WalletCards className="h-6 w-6 text-white/75" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Installment Schedule</h2>
            <p className="mt-1 text-sm text-white/60">
              Auto schedule based on course fee and installment plan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <MethodIcon method={method} />
            <select
              className="bg-transparent text-sm font-bold text-white outline-none"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              disabled={busy}
            >
              <option className="text-black">Cash</option>
              <option className="text-black">UPI</option>
              <option className="text-black">Card</option>
              <option className="text-black">Bank</option>
              <option className="text-black">Online</option>
            </select>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98] disabled:opacity-60"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </button>

          <button
            type="button"
            onClick={onGenerate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            Generate Schedule
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SummaryCard title="Total" value={`₹${computed.total}`} tone="sky" />
        <SummaryCard title="Paid" value={`₹${computed.paid}`} tone="emerald" />
        <SummaryCard title="Due" value={`₹${computed.due}`} tone="amber" />
        <SummaryCard
          title="Next Due"
          value={
            computed.nextDue
              ? `${fmtDate(computed.nextDue.dueDate)} • ₹${computed.nextDue.amount}`
              : "-"
          }
          tone="slate"
          small
        />
      </div>

      {/* Table */}
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
          <div className="p-5 text-white/70">
            No schedule yet. Click <span className="font-bold text-white">Generate Schedule</span>.
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">#</th>
                  <th className="p-4 text-left font-semibold text-white/70">Due Date</th>
                  <th className="p-4 text-left font-semibold text-white/70">Amount</th>
                  <th className="p-4 text-left font-semibold text-white/70">Status</th>
                  <th className="p-4 text-left font-semibold text-white/70">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => {
                  const dueKey = iso(r.dueDate);
                  const overdue = r.status === "DUE" && dueKey && dueKey < todayKey;

                  return (
                    <tr
                      key={r._id}
                      className={[
                        "border-t border-white/10 transition",
                        overdue ? "bg-rose-500/5" : "hover:bg-white/5",
                      ].join(" ")}
                    >
                      <td className="p-4 font-bold text-white">{r.installmentNo}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{fmtDate(r.dueDate)}</div>
                        {overdue && (
                          <div className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-rose-200">
                            <AlertTriangle className="h-4 w-4" />
                            Overdue
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-white">₹{r.amount}</td>
                      <td className="p-4">
                        <span
                          className={[
                            "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-extrabold",
                            badgeClass(r.status, overdue),
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {r.status === "DUE" ? (
                          <button
                            type="button"
                            onClick={() => askPay(r)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/85 px-4 py-2 text-sm font-bold text-white
                                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-white/50 font-semibold">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-white/45">
        When you mark paid, system auto creates entry in payments history.
      </div>

      {/* Confirm Pay Modal */}
      <Modal
        open={confirmPay.open}
        title="Confirm payment"
        onClose={() => setConfirmPay({ open: false, id: "", no: "", amount: 0, due: "" })}
      >
        <div className="text-sm text-white/70">
          Mark installment <span className="font-bold text-white">#{confirmPay.no}</span> as paid?
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Due Date</span>
            <span className="font-bold text-white">{fmtDate(confirmPay.due)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/60">Amount</span>
            <span className="font-extrabold text-white">₹{confirmPay.amount}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/60">Method</span>
            <span className="font-bold text-white">{method}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmPay({ open: false, id: "", no: "", amount: 0, due: "" })}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doPay}
            className="flex-1 rounded-2xl bg-emerald-500/85 px-4 py-3 text-sm font-bold text-white
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            disabled={busy}
          >
            Confirm Paid
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ title, value, tone, small = false }) {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-200/20 bg-emerald-500/10"
      : tone === "amber"
      ? "border-amber-200/20 bg-amber-500/10"
      : tone === "sky"
      ? "border-sky-200/20 bg-sky-500/10"
      : "border-white/10 bg-white/5";

  return (
    <div className={`rounded-2xl border ${toneCls} p-4`}>
      <div className="text-xs font-semibold text-white/60">{title}</div>
      <div className={`mt-1 font-extrabold text-white ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </div>
    </div>
  );
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
