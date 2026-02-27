import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  RefreshCcw,
  Download,
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

const INACTIVITY_FILTER_OPTIONS = [
  { key: "ANY", label: "Any Activity" },
  { key: "30", label: "No payment 30+ days" },
  { key: "60", label: "No payment 60+ days" },
  { key: "90", label: "No payment 90+ days" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

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

function daysSince(dateValue) {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  const stamp = parsed.getTime();
  if (Number.isNaN(stamp)) return null;
  const diff = Date.now() - stamp;
  if (diff <= 0) return 0;
  return Math.floor(diff / DAY_MS);
}

function fmtDaysAgo(dateValue) {
  const days = daysSince(dateValue);
  if (days === null) return "No payment";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function inactivityTone(days, balance) {
  if (Number(balance || 0) <= 0) return "text-emerald-200";
  if (days === null) return "text-rose-200";
  if (days >= 90) return "text-rose-200";
  if (days >= 45) return "text-amber-200";
  return "text-white/80";
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [summary, setSummary] = useState({
    totalStudents: 0,
    dueStudents: 0,
    totalOutstanding: 0,
    newPayments: 0,
    existingPayments: 0,
    completedPayments: 0,
  });

  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [studentGroup, setStudentGroup] = useState("ALL");
  const [paymentGroup, setPaymentGroup] = useState("ALL");
  const [dueOnly, setDueOnly] = useState(false);
  const [inactivityFilter, setInactivityFilter] = useState("ANY");
  const [sortBy, setSortBy] = useState("LATEST");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPaymentsOverview({
        page,
        limit,
        keyword: keyword || undefined,
        batch: batchFilter !== "ALL" ? batchFilter : undefined,
        studentGroup: studentGroup !== "ALL" ? studentGroup : undefined,
        paymentGroup: paymentGroup !== "ALL" ? paymentGroup : undefined,
        dueOnly: dueOnly ? "1" : undefined,
        inactivityDays: inactivityFilter !== "ANY" ? inactivityFilter : undefined,
        sort: sortBy,
      });

      const data = res?.data?.data || [];
      const nextPagination = res?.data?.pagination || {
        page,
        limit,
        total: data.length,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      };

      setRows(data);
      setPagination(nextPagination);
      setSummary(res?.data?.summary || {
        totalStudents: data.length,
        dueStudents: data.filter((r) => Number(r.balance || 0) > 0).length,
        totalOutstanding: data.reduce((sum, r) => sum + Number(r.balance || 0), 0),
        newPayments: data.filter((r) => r.paymentGroup === "NEW").length,
        existingPayments: data.filter((r) => r.paymentGroup === "EXISTING").length,
        completedPayments: data.filter((r) => r.paymentGroup === "COMPLETED").length,
      });

      if (nextPagination.page && nextPagination.page !== page) {
        setPage(nextPagination.page);
      }
    } catch {
      setRows([]);
      setPagination({
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      });
      setSummary({
        totalStudents: 0,
        dueStudents: 0,
        totalOutstanding: 0,
        newPayments: 0,
        existingPayments: 0,
        completedPayments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [keyword, batchFilter, studentGroup, paymentGroup, dueOnly, inactivityFilter, sortBy, limit]);

  useEffect(() => {
    load();
  }, [page, limit, keyword, batchFilter, studentGroup, paymentGroup, dueOnly, inactivityFilter, sortBy]);

  const stats = useMemo(() => {
    return {
      total: Number(summary.totalStudents || 0),
      newPayments: Number(summary.newPayments || 0),
      existingPayments: Number(summary.existingPayments || 0),
      completedPayments: Number(summary.completedPayments || 0),
      dueStudents: Number(summary.dueStudents || 0),
      totalOutstanding: Number(summary.totalOutstanding || 0),
    };
  }, [summary]);

  const batches = useMemo(() => {
    const set = new Set(rows.map((r) => String(r.batchType || "").trim()).filter(Boolean));
    if (batchFilter !== "ALL") set.add(batchFilter);
    return ["ALL", ...Array.from(set)];
  }, [rows, batchFilter]);

  const filtered = rows;

  const filteredStats = useMemo(() => {
    const records = Number(pagination.total || 0);
    const dueCount = Number(summary.dueStudents || 0);
    const outstanding = Number(summary.totalOutstanding || 0);
    return { records, dueCount, outstanding };
  }, [pagination.total, summary.dueStudents, summary.totalOutstanding]);

  const resetRecoveryFilters = () => {
    setDueOnly(false);
    setInactivityFilter("ANY");
  };

  const exportCsv = () => {
    if (!filtered.length) return;

    const header = [
      "Student ID",
      "Student Name",
      "Course",
      "Category",
      "Batch",
      "Student Tab",
      "Payment Tab",
      "Total Fee",
      "Total Paid",
      "Balance",
      "Last Payment",
      "Days Since Last Payment",
    ];

    const lines = filtered.map((row) => {
      const days = daysSince(row.lastPaymentDate);
      const values = [
        row.studentId,
        row.name,
        row.courseTitle,
        row.categoryName,
        row.batchType,
        row.studentGroup,
        row.paymentGroup,
        Number(row.totalFee || 0),
        Number(row.totalPaid || 0),
        Number(row.balance || 0),
        row.lastPaymentDate ? fmtDate(row.lastPaymentDate) : "No payment",
        days === null ? "No payment" : days,
      ];
      return values.map(csvCell).join(",");
    });

    const csv = [header.map(csvCell).join(","), ...lines].join("\n");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-overview-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={!filtered.length}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              Export CSV
            </button>

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
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Students" value={stats.total} tone="sky" />
          <StatCard title="Due Students" value={stats.dueStudents} tone="amber" />
          <StatCard title="New Payments" value={stats.newPayments} tone="sky" />
          <StatCard title="Existing Payments" value={stats.existingPayments} tone="amber" />
          <StatCard title="Completed Payments" value={stats.completedPayments} tone="emerald" />
        </div>
        <p className="mt-2 text-xs font-semibold text-white/60">
          Total outstanding balance: <span className="text-white/90">{money(stats.totalOutstanding)}</span>
        </p>

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
                <option value="INACTIVE">Inactive (Longest)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDueOnly((prev) => !prev)}
            className={clsx(
              "rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
              dueOnly
                ? "border-amber-200/40 bg-amber-500/20 text-amber-100"
                : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
            )}
          >
            {dueOnly ? "Due Only: On" : "Due Only: Off"}
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Filter className="h-4 w-4 text-white/50" />
            <select
              value={inactivityFilter}
              onChange={(e) => setInactivityFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-white outline-none [&>option]:bg-white [&>option]:text-slate-900"
            >
              {INACTIVITY_FILTER_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={resetRecoveryFilters}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/75 transition hover:bg-white/10"
          >
            Reset Recovery Filters
          </button>

          <div className="ml-auto text-xs font-semibold text-white/60">
            Showing {filteredStats.records} | Due {filteredStats.dueCount} | Outstanding{" "}
            <span className="text-white/90">{money(filteredStats.outstanding)}</span>
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
                  <th className="p-4 text-left font-semibold text-white/65">Inactive</th>
                  <th className="p-4 text-left font-semibold text-white/65">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const inactiveDays = daysSince(r.lastPaymentDate);
                  const inactiveLabel =
                    Number(r.balance || 0) <= 0 ? "Cleared" : fmtDaysAgo(r.lastPaymentDate);

                  return (
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
                      <td className={clsx("p-4 font-semibold", inactivityTone(inactiveDays, r.balance))}>
                        {inactiveLabel}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/admin/students/${r.studentMongoId}/profile`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition"
                        >
                          <UserCircle2 className="h-4 w-4" />
                          Master Report
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
        <div>
          Total records: <span className="font-bold text-white">{pagination.total}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 20)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white outline-none [&>option]:bg-white [&>option]:text-slate-900"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={loading || !pagination.hasPrev}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
          >
            Prev
          </button>

          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white">
            Page {pagination.page} / {pagination.totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading || !pagination.hasNext}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
