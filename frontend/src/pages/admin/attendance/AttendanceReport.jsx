import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAttendanceReport } from "../../../services/attendanceApi";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

function monthToRange(monthStr) {
  // monthStr = "2026-02"
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0); // last day of month
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

function percentBadgeClass(p) {
  if (p >= 90) return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  if (p >= 75) return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (p >= 60) return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  return "border-rose-200/30 bg-rose-500/15 text-rose-200";
}

export default function AttendanceReport() {
  const defaultMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [month, setMonth] = useState(defaultMonth);
  const [batchType, setBatchType] = useState("Mon/Wed/Fri");

  const { start, end } = useMemo(() => monthToRange(month), [month]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("percentage"); // percentage | present | absent | name
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
      const res = await getAttendanceReport(start, end, batchType);
      setRows(res?.data?.data || []);
    } catch (e) {
      showToast("Failed to load report", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, batchType]);

  const stats = useMemo(() => {
    const totalStudents = rows.length;
    const avg =
      totalStudents === 0
        ? 0
        : Math.round(rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / totalStudents);
    const above75 = rows.filter((r) => (Number(r.percentage) || 0) >= 75).length;
    return { totalStudents, avg, above75 };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = !q
      ? rows
      : rows.filter((r) =>
          `${r.name || ""} ${r.studentId || ""} ${r.courseTitle || ""}`
            .toLowerCase()
            .includes(q)
        );

    const safeNum = (v) => Number(v) || 0;

    list = [...list].sort((a, b) => {
      if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "present") return safeNum(b.presentDays) - safeNum(a.presentDays);
      if (sortBy === "absent") return safeNum(b.absentDays) - safeNum(a.absentDays);
      return safeNum(b.percentage) - safeNum(a.percentage);
    });

    return list;
  }, [rows, query, sortBy]);

  const downloadCSV = () => {
    if (!rows.length) return;

    const header = [
      "StudentID",
      "Name",
      "Course",
      "Batch",
      "Present",
      "Absent",
      "Total",
      "Percent",
    ];

    const lines = rows.map((r) => [
      r.studentId,
      r.name,
      r.courseTitle || "",
      r.batchType || batchType || "",
      r.presentDays,
      r.absentDays,
      r.totalDays,
      `${r.percentage}%`,
    ]);

    const csv = [header, ...lines]
      .map((arr) => arr.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${month}-${batchType.replaceAll("/", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("CSV downloaded", "success");
  };

  return (
    <div className="p-4 sm:p-6">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Attendance Report</h1>
          <p className="mt-1 text-sm text-white/60">
            Month report: <span className="font-semibold text-white">{start}</span> to{" "}
            <span className="font-semibold text-white">{end}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            Students: <span className="font-semibold text-white">{stats.totalStudents}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            Avg %: <span className="font-semibold text-white">{stats.avg}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            ≥75%: <span className="font-semibold text-white">{stats.above75}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[220px_220px_1fr_220px_auto]">
          <label className="block">
            <span className="text-xs font-semibold text-white/60">Month</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-white/60">Batch</span>
            <select
              value={batchType}
              onChange={(e) => setBatchType(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            >
              <option>Mon/Wed/Fri</option>
              <option>Tue/Thu/Sat</option>
              <option>Weekdays + Sunday</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-white/60">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name / student id / course..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-white/60">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            >
              <option value="percentage">Percentage</option>
              <option value="present">Present days</option>
              <option value="absent">Absent days</option>
              <option value="name">Name</option>
            </select>
          </label>

          <button
            onClick={downloadCSV}
            disabled={!rows.length || loading}
            className="h-[44px] self-end rounded-2xl bg-emerald-500/85 px-5 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(16,185,129,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6 text-white/60">Loading...</div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Photo</th>
                  <th className="p-4 text-left font-semibold text-white/70">Student</th>
                  <th className="p-4 text-left font-semibold text-white/70">Course</th>
                  <th className="p-4 text-left font-semibold text-white/70">Present</th>
                  <th className="p-4 text-left font-semibold text-white/70">Absent</th>
                  <th className="p-4 text-left font-semibold text-white/70">Total</th>
                  <th className="p-4 text-left font-semibold text-white/70">%</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((r) => {
                  const p = Number(r.percentage) || 0;

                  return (
                    <tr
                      key={r.studentMongoId}
                      className="border-t border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="p-4">
                        <div className="h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                          {r.photoUrl ? (
                            <img
                              src={`${API_URL}${r.photoUrl}`}
                              alt={r.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs font-bold text-white/60">
                              {(r.name || "S").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white">{r.name}</div>
                        <div className="text-xs text-white/50">{r.studentId}</div>
                      </td>

                      <td className="p-4">{r.courseTitle || "-"}</td>

                      <td className="p-4 font-semibold text-emerald-200">{r.presentDays}</td>
                      <td className="p-4 font-semibold text-rose-200">{r.absentDays}</td>
                      <td className="p-4">{r.totalDays}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={[
                              "inline-flex min-w-[70px] justify-center rounded-2xl border px-3 py-1.5 text-xs font-bold",
                              percentBadgeClass(p),
                            ].join(" ")}
                          >
                            {p}%
                          </span>

                          <div className="h-2 w-28 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-white/50"
                              style={{ width: `${Math.min(100, Math.max(0, p))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-white/60">
                      No attendance records found for this month/batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
