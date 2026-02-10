import { useEffect, useMemo, useState } from "react";
import { getAttendanceReport } from "../../../services/attendanceApi";

function monthToRange(monthStr) {
  // monthStr = "2026-02"
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0); // last day of month
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export default function AttendanceReport() {
  const defaultMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [month, setMonth] = useState(defaultMonth);
  const [batchType, setBatchType] = useState("Mon/Wed/Fri");

  const { start, end } = useMemo(() => monthToRange(month), [month]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceReport(start, end, batchType);
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, batchType]);

  const downloadCSV = () => {
    const header = ["StudentID", "Name", "Course", "Batch", "Present", "Absent", "Total", "Percent"];
    const lines = rows.map((r) => [
      r.studentId,
      r.name,
      r.courseTitle || "",
      r.batchType || "",
      r.presentDays,
      r.absentDays,
      r.totalDays,
      `${r.percentage}%`,
    ]);

    const csv = [header, ...lines]
      .map((arr) => arr.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${month}-${batchType.replaceAll("/", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-peacock-navy">Attendance Report</h1>
          <p className="text-sm text-gray-600 mt-1">
            Month report: <b>{start}</b> to <b>{end}</b>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-xl p-2 bg-white"
          />

          <select
            value={batchType}
            onChange={(e) => setBatchType(e.target.value)}
            className="border rounded-xl p-2 bg-white"
          >
            <option>Mon/Wed/Fri</option>
            <option>Tue/Thu/Sat</option>
            <option>Weekdays + Sunday</option>
          </select>

          <button
            onClick={downloadCSV}
            disabled={rows.length === 0}
            className="px-4 py-2 rounded-xl bg-peacock-green text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-peacock-border overflow-auto">
        {loading ? (
          <div className="p-5 text-gray-600">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-peacock-bg">
              <tr>
                <th className="p-3 text-left">Photo</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Present</th>
                <th className="p-3 text-left">Absent</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">%</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.studentMongoId} className="border-t">
                  <td className="p-3">
                    {r.photoUrl ? (
                      <img
                        src={`http://localhost:5000${r.photoUrl}`}
                        alt={r.name}
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-peacock-bg border border-peacock-border flex items-center justify-center text-xs text-gray-500">
                        No
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-peacock-navy">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.studentId}</div>
                  </td>

                  <td className="p-3">{r.courseTitle || "-"}</td>
                  <td className="p-3 font-semibold text-green-700">{r.presentDays}</td>
                  <td className="p-3 font-semibold text-red-700">{r.absentDays}</td>
                  <td className="p-3">{r.totalDays}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg border ${
                        r.percentage >= 75
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-yellow-50 border-yellow-200 text-yellow-800"
                      }`}
                    >
                      {r.percentage}%
                    </span>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-5 text-center text-gray-500">
                    No attendance records found for this month/batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
