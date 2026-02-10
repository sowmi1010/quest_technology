import { useEffect, useState } from "react";
import {
  getStudentsByBatch,
  getAttendanceByDate,
  saveAttendance,
} from "../../../services/attendanceApi";

export default function Attendance() {
  const [batchType, setBatchType] = useState("Mon/Wed/Fri");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    const res = await getStudentsByBatch(batchType);
    const list = res.data.data || [];

    setStudents(list);

    setRecords(
      list.map((s) => ({
        studentId: s._id,
        status: "PRESENT",
      }))
    );
  };

  const loadExisting = async () => {
    const res = await getAttendanceByDate(date, batchType);
    const old = res.data.data || [];

    if (!old.length) return;

    setRecords(
      old.map((r) => ({
        studentId: r.studentId._id,
        status: r.status,
      }))
    );
  };

  useEffect(() => {
    (async () => {
      await loadStudents();
      await loadExisting();
    })();
  }, [batchType, date]);

  const toggle = (studentId) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, status: r.status === "PRESENT" ? "ABSENT" : "PRESENT" }
          : r
      )
    );
  };

  const onSave = async () => {
    setSaving(true);

    await saveAttendance({
      date,
      batchType,
      records,
    });

    setSaving(false);
    alert("Attendance Saved ✅");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-peacock-navy">Attendance</h1>

      {/* Filters */}
      <div className="mt-4 flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl p-2"
        />

        <select
          value={batchType}
          onChange={(e) => setBatchType(e.target.value)}
          className="border rounded-xl p-2"
        >
          <option>Mon/Wed/Fri</option>
          <option>Tue/Thu/Sat</option>
          <option>Weekdays + Sunday</option>
        </select>

        <button
          onClick={onSave}
          className="bg-peacock-blue text-white px-4 rounded-xl"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 bg-white rounded-2xl border border-peacock-border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => {
              const rec = records.find((r) => r.studentId === s._id);

              return (
                <tr key={s._id} className="border-t">
                  <td className="p-3">
                    {s.photoUrl && (
                      <img
                        src={`http://localhost:5000${s.photoUrl}`}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                  </td>

                  <td className="p-3 font-medium">{s.name}</td>

                  <td className="p-3">
                    <button
                      onClick={() => toggle(s._id)}
                      className={`px-4 py-1 rounded-xl font-semibold ${
                        rec?.status === "PRESENT"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rec?.status}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
