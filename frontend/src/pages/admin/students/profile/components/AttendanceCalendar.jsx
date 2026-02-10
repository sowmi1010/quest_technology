import { useEffect, useMemo, useState } from "react";
import { getStudentAttendanceRange } from "../../../../../services/attendanceApi";

function monthToRange(monthStr) {
  // "2026-02"
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end), year: y, monthIndex: m - 1, daysInMonth: end.getDate() };
}

function isoKey(d) {
  // date -> YYYY-MM-DD
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export default function AttendanceCalendar({ studentId }) {
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState({}); // { "YYYY-MM-DD": "PRESENT"|"ABSENT" }

  const info = useMemo(() => monthToRange(month), [month]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStudentAttendanceRange(studentId, info.start, info.end);
      const list = res.data.data || [];

      const next = {};
      for (const r of list) next[isoKey(r.date)] = r.status;
      setMap(next);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, studentId]);

  // Build calendar cells
  const cells = useMemo(() => {
    const firstDay = new Date(info.year, info.monthIndex, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const totalCells = Math.ceil((startWeekday + info.daysInMonth) / 7) * 7;

    const arr = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startWeekday + 1;
      if (dayNum < 1 || dayNum > info.daysInMonth) {
        arr.push({ type: "blank" });
      } else {
        const dateObj = new Date(info.year, info.monthIndex, dayNum);
        const key = dateObj.toISOString().slice(0, 10);
        arr.push({ type: "day", dayNum, key, status: map[key] || "" });
      }
    }
    return arr;
  }, [info, map]);

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
    <div className="bg-white rounded-2xl border border-peacock-border p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-bold text-peacock-navy">Attendance Calendar</h2>
          <p className="text-sm text-gray-600 mt-1">
            Present: <b className="text-green-700">{presentCount}</b> • Absent:{" "}
            <b className="text-red-700">{absentCount}</b> • %:{" "}
            <b className="text-peacock-blue">{percent}%</b>
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-xl p-2 bg-white"
          />
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-peacock-border bg-peacock-bg font-semibold text-peacock-navy hover:bg-peacock-border"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Legend color="bg-green-100 border-green-200" text="P = Present" />
        <Legend color="bg-red-100 border-red-200" text="A = Absent" />
        <Legend color="bg-peacock-bg border-peacock-border" text="- = Not marked" />
      </div>

      {/* Calendar */}
      <div className="mt-4 border border-peacock-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 bg-peacock-bg text-xs font-semibold text-gray-600">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-3 border-r last:border-r-0 border-peacock-border">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((c, idx) =>
              c.type === "blank" ? (
                <div
                  key={idx}
                  className="h-20 border-t border-r last:border-r-0 border-peacock-border bg-white"
                />
              ) : (
                <DayCell key={idx} day={c.dayNum} status={c.status} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DayCell({ day, status }) {
  const badge =
    status === "PRESENT"
      ? { text: "P", cls: "bg-green-100 border-green-200 text-green-700" }
      : status === "ABSENT"
      ? { text: "A", cls: "bg-red-100 border-red-200 text-red-700" }
      : { text: "-", cls: "bg-peacock-bg border-peacock-border text-gray-600" };

  return (
    <div className="h-20 border-t border-r last:border-r-0 border-peacock-border bg-white p-2">
      <div className="flex items-start justify-between">
        <div className="text-sm font-semibold text-peacock-navy">{day}</div>
        <div className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${badge.cls}`}>
          {badge.text}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, text }) {
  return (
    <div className={`px-3 py-1 rounded-xl border ${color}`}>
      {text}
    </div>
  );
}
