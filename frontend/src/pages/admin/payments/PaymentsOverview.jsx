import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  RefreshCcw,
  Search,
  Filter,
  ArrowUpDown,
  UserCircle2,
} from "lucide-react";

import { getPaymentsOverview } from "../../../services/paymentApi";

const STUDENT_GROUP_TABS = [
  { key: "ALL", label: "All Students" },
  { key: "NEW", label: "New Students" },
  { key: "EXISTING", label: "Existing Students" },
  { key: "COMPLETED", label: "Completed Students" },
];

const PAYMENT_GROUP_TABS = [
  { key: "ALL", label: "All Payments" },
  { key: "NEW", label: "New Payments" },
  { key: "EXISTING", label: "Existing Payments" },
  { key: "COMPLETED", label: "Completed Payments" },
];

function clsx(...items) {
  return items.filter(Boolean).join(" ");
}

function money(v) {
  const n = Number(v || 0);
  return `Rs ${n.toLocaleString("en-IN")}`;
}

function fmtDate(d) {
  try {
    return d ? new Date(d).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function groupPillClass(group) {
  if (group === "NEW") return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (group === "EXISTING") return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  if (group === "COMPLETED") return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  return "border-white/10 bg-white/5 text-white/80";
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-2xl border px-4 py-2 text-sm font-bold transition active:scale-[0.98]",
        active
          ? "border-sky-200/25 bg-sky-500/15 text-white"
          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, tone = "sky" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200/20 bg-emerald-500/10"
      : tone === "amber"
      ? "border-amber-200/20 bg-amber-500/10"
      : "border-sky-200/20 bg-sky-500/10";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-xs font-semibold text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

export default function PaymentsOverview() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [studentGroup, setStudentGroup] = useState("ALL");
  const [paymentGroup, setPaymentGroup] = useState("ALL");
  const [sortBy, setSortBy] = useState("LATEST");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPaymentsOverview();
      setRows(res?.data?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const newPayments = rows.filter((r) => r.paymentGroup === "NEW").length;
    const existingPayments = rows.filter((r) => r.paymentGroup === "EXISTING").length;
    const completedPayments = rows.filter((r) => r.paymentGroup === "COMPLETED").length;
    return { total, newPayments, existingPayments, completedPayments };
  }, [rows]);

  const batches = useMemo(() => {
    const set = new Set(rows.map((r) => String(r.batchType || "").trim()).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;

    if (studentGroup !== "ALL") list = list.filter((r) => r.studentGroup === studentGroup);
    if (paymentGroup !== "ALL") list = list.filter((r) => r.paymentGroup === paymentGroup);
    if (batchFilter !== "ALL") list = list.filter((r) => (r.batchType || "") === batchFilter);

    if (q) {
      list = list.filter((r) => {
        const line = [
          r.studentId,
          r.name,
          r.courseTitle,
          r.categoryName,
          r.batchType,
        ]
          .map((x) => String(x || "").toLowerCase())
          .join(" ");
        return line.includes(q);
      });
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "NAME") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "BALANCE") return Number(b.balance || 0) - Number(a.balance || 0);
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    return list;
  }, [rows, query, batchFilter, studentGroup, paymentGroup, sortBy]);

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Wallet className="h-6 w-6 text-white/75" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Payments</h1>
              <p className="mt-1 text-sm text-white/60">
                Track new, existing and completed payments across students.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98]"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Students" value={stats.total} tone="sky" />
          <StatCard title="New Payments" value={stats.newPayments} tone="sky" />
          <StatCard title="Existing Payments" value={stats.existingPayments} tone="amber" />
          <StatCard title="Completed Payments" value={stats.completedPayments} tone="emerald" />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-white/55">Student Tabs</div>
          <div className="flex flex-wrap gap-2">
            {STUDENT_GROUP_TABS.map((t) => (
              <TabButton
                key={t.key}
                label={t.label}
                active={studentGroup === t.key}
                onClick={() => setStudentGroup(t.key)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-white/55">Payment Tabs</div>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_GROUP_TABS.map((t) => (
              <TabButton
                key={t.key}
                label={t.label}
                active={paymentGroup === t.key}
                onClick={() => setPaymentGroup(t.key)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Search className="h-5 w-5 text-white/45" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, student id, course, category..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-white outline-none [&>option]:bg-white [&>option]:text-slate-900"
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b === "ALL" ? "All Batches" : b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <ArrowUpDown className="h-4 w-4 text-white/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-white outline-none [&>option]:bg-white [&>option]:text-slate-900"
              >
                <option value="LATEST">Latest</option>
                <option value="NAME">Name (A-Z)</option>
                <option value="BALANCE">Balance (High-Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-5">
            <div className="grid gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-white/70">No payment records found.</div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/65">Student</th>
                  <th className="p-4 text-left font-semibold text-white/65">Course</th>
                  <th className="p-4 text-left font-semibold text-white/65">Batch</th>
                  <th className="p-4 text-left font-semibold text-white/65">Student Tab</th>
                  <th className="p-4 text-left font-semibold text-white/65">Payment Tab</th>
                  <th className="p-4 text-left font-semibold text-white/65">Fee</th>
                  <th className="p-4 text-left font-semibold text-white/65">Paid</th>
                  <th className="p-4 text-left font-semibold text-white/65">Balance</th>
                  <th className="p-4 text-left font-semibold text-white/65">Last Payment</th>
                  <th className="p-4 text-left font-semibold text-white/65">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r.studentMongoId} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{r.name || "-"}</div>
                      <div className="text-xs text-white/50">{r.studentId || "-"}</div>
                    </td>
                    <td className="p-4">
                      <div>{r.courseTitle || "-"}</div>
                      <div className="text-xs text-white/50">{r.categoryName || "-"}</div>
                    </td>
                    <td className="p-4">{r.batchType || "-"}</td>
                    <td className="p-4">
                      <span
                        className={clsx(
                          "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold",
                          groupPillClass(r.studentGroup)
                        )}
                      >
                        {r.studentGroup}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={clsx(
                          "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold",
                          groupPillClass(r.paymentGroup)
                        )}
                      >
                        {r.paymentGroup}
                      </span>
                    </td>
                    <td className="p-4">{money(r.totalFee)}</td>
                    <td className="p-4 text-emerald-200 font-bold">{money(r.totalPaid)}</td>
                    <td className="p-4 text-amber-200 font-bold">{money(r.balance)}</td>
                    <td className="p-4">{fmtDate(r.lastPaymentDate)}</td>
                    <td className="p-4">
                      <Link
                        to={`/admin/students/${r.studentMongoId}/profile`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition"
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
