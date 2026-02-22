import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getStudentsByBatch,
  getAttendanceByDate,
  saveAttendance,
} from "../../../services/attendanceApi";

import { resolveAssetUrl } from "../../../utils/apiConfig";


export default function Attendance() {
  const [batchType, setBatchType] = useState("Mon/Wed/Fri");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast({ show: false, message: "", type }), 2200);
  };

  const loadStudents = async () => {
    const res = await getStudentsByBatch(batchType);
    const list = res?.data?.data || [];
    setStudents(list);

    // default PRESENT for all
    setRecords(
      list.map((s) => ({
        studentId: s._id,
        status: "PRESENT",
      }))
    );
  };

  const loadExisting = async () => {
    const res = await getAttendanceByDate(date, batchType);
    const old = res?.data?.data || [];
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
      try {
        setLoading(true);
        await loadStudents();
        await loadExisting();
      } catch (e) {
        showToast("Failed to load attendance", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      setSaving(true);
      await saveAttendance({ date, batchType, records });
      showToast("Attendance saved successfully", "success");
    } catch (e) {
      showToast("Save failed. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => (s?.name || "").toLowerCase().includes(q));
  }, [students, query]);

  const counts = useMemo(() => {
    const total = students.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = Math.max(0, total - present);
    return { total, present, absent };
  }, [students, records]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Attendance</h1>
          <p className="mt-1 text-sm text-white/60">
            Mark daily attendance and save in one click.
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            Total: <span className="font-semibold text-white">{counts.total}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            Present: <span className="font-semibold text-white">{counts.present}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            Absent: <span className="font-semibold text-white">{counts.absent}</span>
          </div>
        </div>
      </div>

      {/* Filters card */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[220px_220px_1fr_auto]">
          <label className="block">
            <span className="text-xs font-semibold text-white/60">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            <span className="text-xs font-semibold text-white/60">Search Student</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type student name..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            />
          </label>

          <button
            onClick={onSave}
            disabled={saving || loading}
            className="h-[44px] self-end rounded-2xl bg-sky-500/85 px-5 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-sm text-white/85">
            <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
              <tr className="border-b border-white/10">
                <th className="p-4 text-left font-semibold text-white/70">Photo</th>
                <th className="p-4 text-left font-semibold text-white/70">Student</th>
                <th className="p-4 text-left font-semibold text-white/70">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-white/60" colSpan={3}>
                    Loading...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td className="p-6 text-white/60" colSpan={3}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const rec = records.find((r) => r.studentId === s._id);
                  const isPresent = rec?.status === "PRESENT";

                  return (
                    <tr key={s._id} className="border-t border-white/10 hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                          {s.photoUrl ? (
                            <img
                              src={resolveAssetUrl(s.photoUrl)}
                              alt={s.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs font-bold text-white/60">
                              {(s.name || "S").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white">{s.name}</div>
                        {s.phone && <div className="text-xs text-white/50">{s.phone}</div>}
                      </td>

                      <td className="p-4">
                        <motion.button
                          type="button"
                          onClick={() => toggle(s._id)}
                          whileTap={{ scale: 0.98 }}
                          className={[
                            "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold transition",
                            isPresent
                              ? "border-emerald-200/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20"
                              : "border-rose-200/30 bg-rose-500/15 text-rose-200 hover:bg-rose-500/20",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-2 w-2 rounded-full",
                              isPresent ? "bg-emerald-300" : "bg-rose-300",
                            ].join(" ")}
                          />
                          {isPresent ? "PRESENT" : "ABSENT"}
                        </motion.button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

