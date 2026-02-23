import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  RefreshCcw,
  Trash2,
  Pencil,
  UserCircle2,
  X,
  Users,
  BadgeCheck,
  BadgeX,
  Filter,
  ArrowUpDown,
} from "lucide-react";

import { adminDeleteStudent, adminGetStudents } from "../../../services/studentApi";
import AdminToast from "../../../components/admin/common/AdminToast";
import ConfirmModal from "../../../components/admin/common/ConfirmModal";
import SummaryCard from "../../../components/admin/common/SummaryCard";

import { resolveAssetUrl } from "../../../utils/apiConfig";


function clsx(...a) {
  return a.filter(Boolean).join(" ");
}

function isCurrentMonth(dateValue, refDate = new Date()) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === refDate.getFullYear() && d.getMonth() === refDate.getMonth();
}

function getStudentGroup(student, refDate = new Date()) {
  const status = String(student?.status || "ACTIVE").toUpperCase();
  if (status === "INACTIVE") return "COMPLETED";
  if (isCurrentMonth(student?.joiningDate || student?.createdAt, refDate)) return "NEW";
  return "EXISTING";
}

function studentGroupPill(group) {
  if (group === "NEW") return "border-sky-200/20 bg-sky-500/10 text-sky-200";
  if (group === "EXISTING") return "border-amber-200/20 bg-amber-500/10 text-amber-200";
  if (group === "COMPLETED") return "border-emerald-200/20 bg-emerald-500/10 text-emerald-200";
  return "border-white/10 bg-white/5 text-white/80";
}

export default function StudentList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [summary, setSummary] = useState({
    total: 0,
    newStudents: 0,
    existingStudents: 0,
    completedStudents: 0,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // UI state
  const [q, setQ] = useState("");
  const [keyword, setKeyword] = useState("");
  const [batch, setBatch] = useState("ALL");
  const [studentGroup, setStudentGroup] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST"); // NEWEST | NAME

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [del, setDel] = useState({ open: false, id: "", name: "", studentId: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast({ show: false, type, message: "" }), 2200);
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        keyword: keyword || undefined,
        batch: batch !== "ALL" ? batch : undefined,
        studentGroup: studentGroup !== "ALL" ? studentGroup : undefined,
        status: status !== "ALL" ? status : undefined,
        sort: sort === "NAME" ? "name:asc" : "createdAt:desc",
      };

      const res = await adminGetStudents(params);
      const nextRows = res?.data?.data || [];
      const nextPagination = res?.data?.pagination || {
        page,
        limit,
        total: nextRows.length,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      };
      const nextSummary = res?.data?.summary || {
        total: nextRows.length,
        newStudents: nextRows.filter((s) => getStudentGroup(s) === "NEW").length,
        existingStudents: nextRows.filter((s) => getStudentGroup(s) === "EXISTING").length,
        completedStudents: nextRows.filter((s) => getStudentGroup(s) === "COMPLETED").length,
      };

      setRows(nextRows);
      setPagination(nextPagination);
      setSummary(nextSummary);

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
        total: 0,
        newStudents: 0,
        existingStudents: 0,
        completedStudents: 0,
      });
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(q.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [keyword, batch, studentGroup, status, sort, limit]);

  useEffect(() => {
    load();
  }, [page, limit, keyword, batch, studentGroup, status, sort]);

  const askDelete = (s) => {
    setDel({ open: true, id: s._id, name: s.name, studentId: s.studentId });
  };

  const doDelete = async () => {
    if (!del.id) return;
    setBusy(true);
    try {
      await adminDeleteStudent(del.id);
      showToast("Student deleted", "success");
      setDel({ open: false, id: "", name: "", studentId: "" });
      await load();
    } catch {
      showToast("Failed to delete student", "error");
    } finally {
      setBusy(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: Number(summary.total || 0),
      newStudents: Number(summary.newStudents || 0),
      existingStudents: Number(summary.existingStudents || 0),
      completedStudents: Number(summary.completedStudents || 0),
    };
  }, [summary]);

  const batches = useMemo(() => {
    const set = new Set(rows.map((r) => r.batchType).filter(Boolean));
    if (batch !== "ALL") set.add(batch);
    return ["ALL", ...Array.from(set)];
  }, [rows, batch]);

  const filtered = rows;

  const currentMonthLabel = useMemo(
    () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    []
  );

  const studentTabs = useMemo(
    () => [
      { key: "ALL", label: `All (${stats.total})` },
      { key: "NEW", label: `New (${currentMonthLabel}) - ${stats.newStudents}` },
      { key: "EXISTING", label: `Existing - ${stats.existingStudents}` },
      { key: "COMPLETED", label: `Completed - ${stats.completedStudents}` },
    ],
    [currentMonthLabel, stats]
  );

  return (
    <div className="p-4 sm:p-6">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, type: toast.type, message: "" })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/18 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/12 blur-3xl" />

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Users className="h-6 w-6 text-white/75" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50">Students</div>
              <h1 className="text-2xl font-extrabold text-white">Student List</h1>
              <p className="mt-1 text-sm text-white/60">
                Search, filter and manage student profiles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white/85 hover:bg-white/10 transition active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCcw className="h-5 w-5" />
              Refresh
            </button>

            <Link
              to="/admin/students/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-extrabold text-white
                         shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                         transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Add Student
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Users} title="Total" value={stats.total} tone="sky" />
          <SummaryCard icon={Plus} title="New" value={stats.newStudents} tone="sky" />
          <SummaryCard icon={BadgeCheck} title="Existing" value={stats.existingStudents} tone="emerald" />
          <SummaryCard icon={BadgeX} title="Completed" value={stats.completedStudents} tone="rose" />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-white/55">Student Tabs</div>
          <div className="flex flex-wrap gap-2">
            {studentTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStudentGroup(tab.key)}
                className={clsx(
                  "rounded-2xl border px-4 py-2 text-sm font-extrabold transition active:scale-[0.98]",
                  studentGroup === tab.key
                    ? "border-sky-200/25 bg-sky-500/15 text-white"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Search className="h-5 w-5 text-white/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search: name, student id, phone, parent phone, course..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-transparent text-sm font-extrabold text-white outline-none"
              >
                {batches.map((b) => (
                  <option key={b} value={b} className="text-black">
                    {b === "ALL" ? "All Batches" : b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-transparent text-sm font-extrabold text-white outline-none"
              >
                <option value="ALL" className="text-black">
                  All Status
                </option>
                <option value="ACTIVE" className="text-black">
                  ACTIVE
                </option>
                <option value="INACTIVE" className="text-black">
                  INACTIVE
                </option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <ArrowUpDown className="h-4 w-4 text-white/50" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-transparent text-sm font-extrabold text-white outline-none"
              >
                <option value="NEWEST" className="text-black">
                  Newest
                </option>
                <option value="NAME" className="text-black">
                  Name (A-Z)
                </option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-5">
            <div className="grid gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-white/70">No students found.</div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/65">Photo</th>
                  <th className="p-4 text-left font-semibold text-white/65">Student ID</th>
                  <th className="p-4 text-left font-semibold text-white/65">Name</th>
                  <th className="p-4 text-left font-semibold text-white/65">Course</th>
                  <th className="p-4 text-left font-semibold text-white/65">Student Phone</th>
                  <th className="p-4 text-left font-semibold text-white/65">Parent Phone</th>
                  <th className="p-4 text-left font-semibold text-white/65">Batch</th>
                  <th className="p-4 text-left font-semibold text-white/65">Student Tab</th>
                  <th className="p-4 text-left font-semibold text-white/65">Status</th>
                  <th className="p-4 text-left font-semibold text-white/65">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4">
                      {s.photoUrl ? (
                        <img
                          src={resolveAssetUrl(s.photoUrl)}
                          alt={s.name}
                          className="h-10 w-10 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center text-[10px] font-bold text-white/45">
                          NO
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-extrabold text-white">{s.studentId}</td>

                    <td className="p-4">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-xs text-white/50">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}
                      </div>
                    </td>

                    <td className="p-4 text-white/80">{s.courseId?.title || "-"}</td>
                    <td className="p-4 text-white/80">{s.studentNumber || "-"}</td>
                    <td className="p-4 text-white/80">{s.fatherNumber || "-"}</td>
                    <td className="p-4 text-white/80">{s.batchType || "-"}</td>
                    <td className="p-4">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-2xl border px-3 py-1.5 text-xs font-extrabold",
                          studentGroupPill(getStudentGroup(s))
                        )}
                      >
                        {getStudentGroup(s)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-extrabold",
                          (s.status || "ACTIVE") === "ACTIVE"
                            ? "border-emerald-200/20 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-200/20 bg-rose-500/10 text-rose-200"
                        )}
                      >
                        {(s.status || "ACTIVE") === "ACTIVE" ? (
                          <BadgeCheck className="h-4 w-4" />
                        ) : (
                          <BadgeX className="h-4 w-4" />
                        )}
                        {s.status || "ACTIVE"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/students/${s._id}/profile`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-white/85 hover:bg-white/10 transition"
                        >
                          <UserCircle2 className="h-4 w-4" />
                          Profile
                        </Link>

                        <Link
                          to={`/admin/students/${s._id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-white/85 hover:bg-white/10 transition"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => askDelete(s)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2 text-xs font-extrabold text-rose-200 hover:bg-rose-500/15 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
        <div>
          Total students: <span className="font-bold text-white">{pagination.total}</span>
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

      {/* Delete Modal */}
      <ConfirmModal
        open={del.open}
        title="Delete student?"
        onClose={() => setDel({ open: false, id: "", name: "", studentId: "" })}
      >
        <div className="text-sm text-white/70">
          This action will permanently remove the student.
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
          <div className="flex items-center justify-between">
            <span className="text-white/55">Student</span>
            <span className="font-extrabold text-white">{del.name}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/55">Student ID</span>
            <span className="font-extrabold text-white">{del.studentId}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setDel({ open: false, id: "", name: "", studentId: "" })}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white/85 hover:bg-white/10 disabled:opacity-60"
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-2xl bg-rose-500/85 px-4 py-3 text-sm font-extrabold text-white
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}

