import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCcw, CalendarDays } from "lucide-react";
import {
  getStudentAttendanceRange,
  setStudentAttendanceByDate,
} from "../../../../../services/attendanceApi";

function monthToRange(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const fmt = (d) => d.toISOString().slice(0, 10);

  return {
    start: fmt(start),
    end: fmt(end),
    year: y,
    monthIndex: m - 1,
    daysInMonth: end.getDate(),
    label: start.toLocaleString("en-IN", { month: "long", year: "numeric" }),
  };
}

function isoKey(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

function addMonths(yyyyMm, delta) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function weekdayLabels() {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

function statusPill(status) {
  if (status === "PRESENT") return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  if (status === "ABSENT") return "border-rose-200/30 bg-rose-500/15 text-rose-200";
  return "border-white/10 bg-white/5 text-white/60";
}

export default function AttendanceCalendar({ studentId }) {
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(defaultMonth);

  const [loading, setLoading] = useState(true);
  const [savingByDate, setSavingByDate] = useState({});
  const [error, setError] = useState("");
  const [map, setMap] = useState({}); // { "YYYY-MM-DD": "PRESENT"|"ABSENT" }

  const info = useMemo(() => monthToRange(month), [month]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStudentAttendanceRange(studentId, info.start, info.end);
      const list = res?.data?.data || [];
      const next = {};
      for (const r of list) next[isoKey(r.date)] = r.status;
      setMap(next);
    } catch (e) {
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, studentId]);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const markAttendance = async (dateKey, status) => {
    const prevStatus = map[dateKey] || "";
    if (prevStatus === status) return;

    setError("");
    setMap((prev) => ({ ...prev, [dateKey]: status }));
    setSavingByDate((prev) => ({ ...prev, [dateKey]: true }));

    try {
      await setStudentAttendanceByDate(studentId, { date: dateKey, status });
    } catch (e) {
      setMap((prev) => {
        const next = { ...prev };
        if (prevStatus) next[dateKey] = prevStatus;
        else delete next[dateKey];
        return next;
      });
      setError("Failed to save attendance. Please try again.");
    } finally {
      setSavingByDate((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    }
  };

  const cells = useMemo(() => {
    const firstDay = new Date(info.year, info.monthIndex, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const totalCells = Math.ceil((startWeekday + info.daysInMonth) / 7) * 7;

    const arr = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startWeekday + 1;
      if (dayNum < 1 || dayNum > info.daysInMonth) {
        arr.push({ type: "blank", key: `b-${i}` });
      } else {
        const dateObj = new Date(info.year, info.monthIndex, dayNum);
        const key = dateObj.toISOString().slice(0, 10);
        arr.push({
          type: "day",
          key,
          dayNum,
          status: map[key] || "",
          isToday: key === todayKey,
          isFuture: key > todayKey,
        });
      }
    }
    return arr;
  }, [info, map, todayKey]);

  const presentCount = useMemo(
    () => Object.values(map).filter((s) => s === "PRESENT").length,
    [map]
  );
  const absentCount = useMemo(
    () => Object.values(map).filter((s) => s === "ABSENT").length,
    [map]
  );
  const totalMarked = presentCount + absentCount;
  const percent = totalMarked ? Math.round((presentCount / totalMarked) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <CalendarDays className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Attendance Calendar</h2>
              <p className="text-sm text-white/60">{info.label}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98]"
            title="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
            Prev
          </button>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                       focus:ring-2 focus:ring-sky-400/40"
          />

          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98]"
            title="Next month"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98]"
            title="Refresh"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard title="Present" value={presentCount} tone="emerald" />
        <SummaryCard title="Absent" value={absentCount} tone="rose" />
        <SummaryCard title="Attendance %" value={`${percent}%`} tone="sky" />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Legend text="Present" cls="border-emerald-200/30 bg-emerald-500/15 text-emerald-200" />
        <Legend text="Absent" cls="border-rose-200/30 bg-rose-500/15 text-rose-200" />
        <Legend text="Not marked" cls="border-white/10 bg-white/5 text-white/70" />
        <Legend text="Today" cls="border-sky-200/30 bg-sky-500/15 text-sky-200" />
      </div>
      <p className="mt-2 text-xs text-white/55">Click P or A inside a day to mark attendance.</p>
      {error && <p className="mt-2 text-xs font-semibold text-rose-300">{error}</p>}

      {/* Calendar */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-7 border-b border-white/10 bg-slate-950/60 text-xs font-semibold text-white/60">
          {weekdayLabels().map((d) => (
            <div key={d} className="p-3 border-r last:border-r-0 border-white/10">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-5">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              className="grid grid-cols-7"
            >
              {cells.map((c) =>
                c.type === "blank" ? (
                  <div
                    key={c.key}
                    className="h-24 border-t border-r last:border-r-0 border-white/10 bg-transparent"
                  />
                ) : (
                  <DayCell
                    key={c.key}
                    day={c.dayNum}
                    status={c.status}
                    isToday={c.isToday}
                    isFuture={c.isFuture}
                    saving={Boolean(savingByDate[c.key])}
                    onMark={(status) => markAttendance(c.key, status)}
                  />
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, tone }) {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-200/20 bg-emerald-500/10"
      : tone === "rose"
      ? "border-rose-200/20 bg-rose-500/10"
      : "border-sky-200/20 bg-sky-500/10";

  return (
    <div className={`rounded-2xl border ${toneCls} p-4`}>
      <div className="text-xs font-semibold text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

function DayCell({ day, status, isToday, isFuture, saving, onMark }) {
  const badge = status === "PRESENT" ? "P" : status === "ABSENT" ? "A" : "-";
  const disableActions = isFuture || saving;

  return (
    <div
      className={[
        "h-24 border-t border-r last:border-r-0 border-white/10 p-2 transition",
        "hover:bg-white/5",
        isToday ? "bg-sky-500/10" : "bg-transparent",
        isFuture ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-bold text-white">{day}</div>
        <div
          className={[
            "px-2 py-0.5 rounded-xl border text-xs font-extrabold",
            statusPill(status),
          ].join(" ")}
          title={status || "Not marked"}
        >
          {badge}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          disabled={disableActions}
          onClick={() => onMark("PRESENT")}
          className={[
            "rounded-lg border px-2 py-0.5 text-[10px] font-extrabold transition",
            status === "PRESENT"
              ? "border-emerald-200/30 bg-emerald-500/20 text-emerald-100"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
            disableActions ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          P
        </button>
        <button
          type="button"
          disabled={disableActions}
          onClick={() => onMark("ABSENT")}
          className={[
            "rounded-lg border px-2 py-0.5 text-[10px] font-extrabold transition",
            status === "ABSENT"
              ? "border-rose-200/30 bg-rose-500/20 text-rose-100"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
            disableActions ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          A
        </button>
        {saving && <span className="text-[10px] font-semibold text-white/55">Saving...</span>}
      </div>
    </div>
  );
}

function Legend({ text, cls }) {
  return <div className={`px-3 py-1 rounded-2xl border text-xs font-bold ${cls}`}>{text}</div>;
}
