import { useEffect, useMemo, useState } from "react";
import {
  addPayment,
  getStudentPayments,
  deletePayment,
} from "../../../../../services/paymentApi";
import {
  Wallet,
  Plus,
  Trash2,
  RefreshCcw,
  Banknote,
  CreditCard,
  Smartphone,
  Landmark,
} from "lucide-react";
import AdminToast from "../../../../../components/admin/common/AdminToast";
import ConfirmModal from "../../../../../components/admin/common/ConfirmModal";
import SummaryCard from "../../../../../components/admin/common/SummaryCard";

function fmtDate(d) {
  try {
    return d ? new Date(d).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function MethodIcon({ method }) {
  const m = String(method || "").toLowerCase();
  if (m === "upi" || m === "online") return <Smartphone className="h-4 w-4" />;
  if (m === "card") return <CreditCard className="h-4 w-4" />;
  if (m === "bank") return <Landmark className="h-4 w-4" />;
  return <Banknote className="h-4 w-4" />;
}

export default function PaymentsTab({ studentId }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDel, setConfirmDel] = useState({ open: false, id: "", amount: 0, date: "" });

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
      const res = await getStudentPayments(studentId);
      setRows(res?.data?.data?.payments || []);
      setSummary(res?.data?.data?.summary || {});
    } catch {
      setRows([]);
      setSummary({});
      showToast("Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const totalFee = Number(summary.totalFee || 0);
  const totalPaid = Number(summary.totalPaid || 0);
  const balance = Number(summary.balance || Math.max(0, totalFee - totalPaid));

  const progress = useMemo(() => {
    if (!totalFee) return 0;
    const p = Math.round((totalPaid / totalFee) * 100);
    return Math.max(0, Math.min(100, p));
  }, [totalFee, totalPaid]);

  const canAdd = useMemo(() => {
    const a = Number(amount);
    return !busy && a > 0 && Boolean(paymentDate);
  }, [amount, busy, paymentDate]);

  const onAdd = async () => {
    const a = Number(amount);
    if (!a || a <= 0) return;

    setBusy(true);
    try {
      await addPayment({ studentId, amount: a, method, date: paymentDate });
      setAmount("");
      showToast("Payment added", "success");
      await load();
    } catch {
      showToast("Failed to add payment", "error");
    } finally {
      setBusy(false);
    }
  };

  const askDelete = (p) => {
    setConfirmDel({
      open: true,
      id: p._id,
      amount: Number(p.amount || 0),
      date: p.date,
    });
  };

  const doDelete = async () => {
    if (!confirmDel.id) return;

    setBusy(true);
    try {
      await deletePayment(confirmDel.id);
      showToast("Payment deleted", "success");
      setConfirmDel({ open: false, id: "", amount: 0, date: "" });
      await load();
    } catch {
      showToast("Failed to delete payment", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "", type: toast.type })}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Wallet className="h-6 w-6 text-white/75" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Payments</h2>
            <p className="mt-1 text-sm text-white/60">Track payments, balance and history.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard title="Total Fee" value={`₹${totalFee}`} tone="sky" />
        <SummaryCard title="Paid" value={`₹${totalPaid}`} tone="emerald" />
        <SummaryCard title="Balance" value={`₹${balance}`} tone="amber" />
      </div>

      {/* Progress */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-white/60">
          <span>Payment Progress</span>
          <span className="text-white/80">{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-sky-500/80" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Add payment */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold text-white/60">Add Payment</div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full sm:w-56 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                       focus:ring-2 focus:ring-sky-400/40"
          />

          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full sm:w-48 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                       focus:ring-2 focus:ring-sky-400/40"
            disabled={busy}
          />

          <div className="inline-flex w-full sm:w-auto items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <MethodIcon method={method} />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-white outline-none"
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
            onClick={onAdd}
            disabled={!canAdd}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
            Add
          </button>
        </div>
      </div>

      {/* History */}
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
          <div className="p-5 text-white/70">No payments yet.</div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Date</th>
                  <th className="p-4 text-left font-semibold text-white/70">Amount</th>
                  <th className="p-4 text-left font-semibold text-white/70">Method</th>
                  <th className="p-4 text-left font-semibold text-white/70">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((p) => (
                  <tr key={p._id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-4 text-white/80">{fmtDate(p.date)}</td>
                    <td className="p-4 font-extrabold text-white">₹{p.amount}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80">
                        <MethodIcon method={p.method} />
                        {p.method}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => askDelete(p)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200
                                   hover:bg-rose-500/15 transition active:scale-[0.98]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        open={confirmDel.open}
        title="Delete payment?"
        onClose={() => setConfirmDel({ open: false, id: "", amount: 0, date: "" })}
      >
        <div className="text-sm text-white/70">
          This will permanently remove the payment entry.
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Date</span>
            <span className="font-bold text-white">{fmtDate(confirmDel.date)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/60">Amount</span>
            <span className="font-extrabold text-white">₹{confirmDel.amount}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDel({ open: false, id: "", amount: 0, date: "" })}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-2xl bg-rose-500/85 px-4 py-3 text-sm font-bold text-white
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}
