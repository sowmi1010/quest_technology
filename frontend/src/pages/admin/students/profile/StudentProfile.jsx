import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Pencil,
  RefreshCcw,
  User,
} from "lucide-react";

import { adminGetStudentMaster } from "../../../../services/studentApi";
import { resolveAssetUrl } from "../../../../utils/apiConfig";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
}

function formatINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Rs 0";
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function toMonthToken(date) {
  return date.toISOString().slice(0, 7);
}

function addMonths(monthToken, delta) {
  const [year, month] = String(monthToken || "").split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return toMonthToken(new Date());
  }

  const next = new Date(year, month - 1 + delta, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthToken) {
  const [year, month] = String(monthToken || "").split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return "Current Month";

  const value = new Date(year, month - 1, 1);
  return value.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function buildAttendanceCells(monthToken, statusMap, todayKey) {
  const [year, month] = String(monthToken || "").split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return [];

  const monthIndex = month - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - startWeekday + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push({ type: "blank", key: `blank-${i}` });
      continue;
    }

    const date = new Date(year, monthIndex, dayNumber);
    const dateKey = toDateKey(date);
    const status = statusMap[dateKey] || "";

    cells.push({
      type: "day",
      key: dateKey,
      dayNumber,
      dateKey,
      status,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }

  return cells;
}

function attendanceBadgeClass(status) {
  if (status === "PRESENT") {
    return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  }
  if (status === "ABSENT") {
    return "border-rose-200/30 bg-rose-500/15 text-rose-200";
  }
  return "border-white/10 bg-white/5 text-white/65";
}

function performanceBadgeClass(status) {
  if (status === "COMPLETED") {
    return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  }
  if (status === "IN_PROGRESS") {
    return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  }
  if (status === "ON_HOLD") {
    return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  }
  return "border-white/10 bg-white/5 text-white/70";
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-white/55">{label}</div>
      <div className="mt-1 break-words text-sm font-extrabold text-white">{value || "-"}</div>
    </div>
  );
}

function StatCard({ title, value, tone = "sky" }) {
  const tones = {
    sky: "from-sky-500/25 to-cyan-500/20 text-sky-100 border-sky-200/15",
    emerald: "from-emerald-500/25 to-teal-500/20 text-emerald-100 border-emerald-200/15",
    amber: "from-amber-500/25 to-orange-500/20 text-amber-100 border-amber-200/15",
    rose: "from-rose-500/25 to-pink-500/20 text-rose-100 border-rose-200/15",
  };

  return (
    <div
      className={[
        "rounded-2xl border bg-gradient-to-br px-4 py-3",
        tones[tone] || tones.sky,
      ].join(" ")}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</div>
      <div className="mt-1 text-lg font-extrabold text-white">{value}</div>
    </div>
  );
}

function StudentProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-6 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-14 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const [month, setMonth] = useState(() => toMonthToken(new Date()));
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminGetStudentMaster(id, { month });
      setPayload(res?.data?.data || null);
    } catch (err) {
      setPayload(null);
      setError(err?.response?.data?.message || "Failed to load student master report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, month]);

  const student = payload?.student || null;
  const attendance = payload?.attendance || {
    month,
    calendar: [],
    monthSummary: { present: 0, absent: 0, totalMarked: 0, attendancePercent: 0 },
    overallSummary: { present: 0, absent: 0, totalMarked: 0, attendancePercent: 0 },
  };
  const payments = payload?.payments || { summary: {}, records: [] };
  const performance = payload?.performance || { summary: {}, records: [] };
  const certificates = payload?.certificates || { summary: {}, records: [] };

  const photoUrl = useMemo(
    () => resolveAssetUrl(student?.photoUrl || ""),
    [student?.photoUrl]
  );

  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const attendanceMap = useMemo(() => {
    const map = {};
    for (const row of attendance.calendar || []) {
      const key = row?.dateKey || toDateKey(row?.date);
      if (!key) continue;
      map[key] = row?.status || "";
    }
    return map;
  }, [attendance.calendar]);

  const resolvedMonth = attendance.month || month;

  const attendanceCells = useMemo(
    () => buildAttendanceCells(resolvedMonth, attendanceMap, todayKey),
    [resolvedMonth, attendanceMap, todayKey]
  );

  const paymentRows = payments.records || [];
  const performanceRows = performance.records || [];
  const certificateRows = certificates.records || [];

  if (loading && !payload) return <StudentProfileSkeleton />;

  if (!student) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur-xl">
          {error || "Student not found"}
          <div className="mt-4">
            <Link
              to="/admin/students"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.name}
                className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/10 text-xs font-bold text-white/50">
                No Photo
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-white/50">{student.studentId}</div>
              <h1 className="mt-1 text-2xl font-extrabold text-white">Student Master Report</h1>
              <div className="mt-1 text-sm text-white/70">
                {student.name} <span className="text-white/35">|</span> Course {" "}
                <span className="font-bold text-white">{student.courseId?.title || "-"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCcw className="h-5 w-5" />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/admin/students"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>

            <Link
              to={`/admin/students/${student._id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110"
            >
              <Pencil className="h-5 w-5" />
              Edit
            </Link>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p> : null}
      </motion.div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-white/80" />
          <h2 className="text-base font-extrabold">Student Basic Info</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Student ID" value={student.studentId} />
          <InfoCard label="Student Name" value={student.name} />
          <InfoCard label="Status" value={student.status} />
          <InfoCard label="Course" value={student.courseId?.title} />
          <InfoCard label="Course Duration" value={student.courseId?.duration} />
          <InfoCard label="Batch" value={student.batchType} />
          <InfoCard label="Joining Date" value={formatDate(student.joiningDate)} />
          <InfoCard label="Student Number" value={student.studentNumber} />
          <InfoCard label="Father Name" value={student.fatherName} />
          <InfoCard label="Father Number" value={student.fatherNumber} />
          <InfoCard label="Address" value={student.address} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-white">
            <CalendarDays className="h-5 w-5 text-white/80" />
            <h2 className="text-base font-extrabold">Attendance Summary + Calendar</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth((prev) => addMonths(prev, -1))}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white outline-none"
            />

            <button
              type="button"
              onClick={() => setMonth((prev) => addMonths(prev, 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-white/60">{monthLabel(resolvedMonth)}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard title="Month Present" value={attendance.monthSummary?.present || 0} tone="emerald" />
          <StatCard title="Month Absent" value={attendance.monthSummary?.absent || 0} tone="rose" />
          <StatCard title="Month %" value={`${attendance.monthSummary?.attendancePercent || 0}%`} tone="sky" />
          <StatCard title="Overall Present" value={attendance.overallSummary?.present || 0} tone="emerald" />
          <StatCard title="Overall Absent" value={attendance.overallSummary?.absent || 0} tone="rose" />
          <StatCard title="Overall %" value={`${attendance.overallSummary?.attendancePercent || 0}%`} tone="sky" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-2xl border border-emerald-200/30 bg-emerald-500/15 px-3 py-1 font-bold text-emerald-200">PRESENT</span>
          <span className="rounded-2xl border border-rose-200/30 bg-rose-500/15 px-3 py-1 font-bold text-rose-200">ABSENT</span>
          <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 font-bold text-white/65">NOT MARKED</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-7 border-b border-white/10 bg-slate-950/70 text-xs font-semibold text-white/60">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="border-r border-white/10 p-3 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {attendanceCells.map((cell) => {
              if (cell.type === "blank") {
                return (
                  <div
                    key={cell.key}
                    className="h-20 border-r border-t border-white/10 last:border-r-0"
                  />
                );
              }

              return (
                <div
                  key={cell.key}
                  className={[
                    "h-20 border-r border-t border-white/10 p-2 last:border-r-0",
                    cell.isToday ? "bg-sky-500/10" : "bg-transparent",
                    cell.isFuture ? "opacity-70" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{cell.dayNumber}</span>
                    <span
                      className={[
                        "rounded-xl border px-2 py-0.5 text-[10px] font-bold",
                        attendanceBadgeClass(cell.status),
                      ].join(" ")}
                    >
                      {cell.status === "PRESENT" ? "P" : cell.status === "ABSENT" ? "A" : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5 text-white/80" />
          <h2 className="text-base font-extrabold">Payment Summary + Due Amount</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Fee" value={formatINR(payments.summary?.totalFee)} tone="sky" />
          <StatCard title="Total Paid" value={formatINR(payments.summary?.totalPaid)} tone="emerald" />
          <StatCard title="Due Amount" value={formatINR(payments.summary?.balance)} tone="amber" />
          <StatCard title="Payment Count" value={payments.summary?.paymentCount || 0} tone="sky" />
          <StatCard title="Progress" value={`${payments.summary?.paymentProgress || 0}%`} tone="emerald" />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-xs font-semibold text-white/55">Recent Payments</div>
          {paymentRows.length === 0 ? (
            <div className="text-sm text-white/65">No payment entries available.</div>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm text-white/85">
                <thead className="sticky top-0 bg-slate-950/70 text-white/60">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((row) => (
                    <tr key={row._id} className="border-t border-white/10">
                      <td className="p-3">{formatDate(row.date)}</td>
                      <td className="p-3 font-bold text-white">{formatINR(row.amount)}</td>
                      <td className="p-3">{row.method || "-"}</td>
                      <td className="p-3 text-white/70">{row.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5 text-white/80" />
          <h2 className="text-base font-extrabold">Performance Updates</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total" value={performance.summary?.total || 0} tone="sky" />
          <StatCard title="Completed" value={performance.summary?.completed || 0} tone="emerald" />
          <StatCard title="In Progress" value={performance.summary?.inProgress || 0} tone="sky" />
          <StatCard title="On Hold" value={performance.summary?.onHold || 0} tone="amber" />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          {performanceRows.length === 0 ? (
            <div className="text-sm text-white/65">No performance updates available.</div>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm text-white/85">
                <thead className="sticky top-0 bg-slate-950/70 text-white/60">
                  <tr>
                    <th className="p-3 text-left">Created</th>
                    <th className="p-3 text-left">Tool</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Start</th>
                    <th className="p-3 text-left">End</th>
                    <th className="p-3 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceRows.map((row) => (
                    <tr key={row._id} className="border-t border-white/10">
                      <td className="p-3">{formatDate(row.createdAt)}</td>
                      <td className="p-3 font-bold text-white">{row.toolName || "-"}</td>
                      <td className="p-3">
                        <span
                          className={[
                            "rounded-2xl border px-3 py-1 text-xs font-bold",
                            performanceBadgeClass(row.status),
                          ].join(" ")}
                        >
                          {String(row.status || "-").replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="p-3">{formatDate(row.startDate)}</td>
                      <td className="p-3">{formatDate(row.endDate)}</td>
                      <td className="p-3 text-white/70">{row.performanceMessage || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-white">
          <Award className="h-5 w-5 text-white/80" />
          <h2 className="text-base font-extrabold">Certificates</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Certificates" value={certificates.summary?.total || 0} tone="sky" />
          <StatCard
            title="Latest Issue"
            value={formatDate(certificates.summary?.latestIssueDate)}
            tone="emerald"
          />
          <StatCard
            title="Storage"
            value={certificateRows[0]?.storageProvider || "-"}
            tone="amber"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          {certificateRows.length === 0 ? (
            <div className="text-sm text-white/65">No certificates generated yet.</div>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm text-white/85">
                <thead className="sticky top-0 bg-slate-950/70 text-white/60">
                  <tr>
                    <th className="p-3 text-left">Cert No</th>
                    <th className="p-3 text-left">Issue Date</th>
                    <th className="p-3 text-left">Course</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificateRows.map((row) => {
                    const pdfUrl = resolveAssetUrl(row.pdfUrl || "");
                    const verifyPath = `/verify/${encodeURIComponent(row.certNo || "")}`;

                    return (
                      <tr key={row._id} className="border-t border-white/10">
                        <td className="p-3 font-bold text-white">{row.certNo || "-"}</td>
                        <td className="p-3">{formatDate(row.issueDate)}</td>
                        <td className="p-3">{row.courseId?.title || "-"}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {pdfUrl ? (
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/85 hover:bg-white/10"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                PDF
                              </a>
                            ) : null}
                            {row.certNo ? (
                              <Link
                                to={verifyPath}
                                target="_blank"
                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/85 hover:bg-white/10"
                              >
                                Verify
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
