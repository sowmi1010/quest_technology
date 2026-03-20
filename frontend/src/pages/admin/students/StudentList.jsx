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
  ChevronLeft,
  ChevronRight,
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
  if (group === "NEW") return "border-sky-300/25 bg-sky-500/15 text-sky-100";
  if (group === "EXISTING") return "border-amber-300/25 bg-amber-500/15 text-amber-100";
  if (group === "COMPLETED") return "border-emerald-300/25 bg-emerald-500/15 text-emerald-100";
  return "border-white/15 bg-white/5 text-white/80";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

  const [q, setQ] = useState("");
  const [keyword, setKeyword] = useState("");
  const [batch, setBatch] = useState("ALL");
  const [studentGroup, setStudentGroup] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

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
      { key: "NEW", label: `New (${currentMonthLabel}) ${stats.newStudents}` },
      { key: "EXISTING", label: `Existing ${stats.existingStudents}` },
      { key: "COMPLETED", label: `Completed ${stats.completedStudents}` },
    ],
    [currentMonthLabel, stats]
  );

  return (
    <div className="space-y-4">
      <AdminToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, type: toast.type, message: "" })}
      />

      <motion.section
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10">
              <Users className="h-6 w-6 text-white/85" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Admin</p>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Students</h1>
              <p className="mt-1 text-sm text-white/65">Clean view for search, filters and profile actions.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              to="/admin/students/new"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Link>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Users} title="Total" value={stats.total} tone="sky" />
          <SummaryCard icon={Plus} title="New" value={stats.newStudents} tone="emerald" />
          <SummaryCard icon={BadgeCheck} title="Existing" value={stats.existingStudents} tone="amber" />
          <SummaryCard icon={BadgeX} title="Completed" value={stats.completedStudents} tone="rose" />
        </div>

        <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/5 p-2">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Student Segment</div>
          <div className="flex flex-wrap gap-2">
            {studentTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStudentGroup(tab.key)}
                className={clsx(
                  "rounded-xl border px-3.5 py-2 text-xs font-semibold transition sm:text-sm",
                  studentGroup === tab.key
                    ? "border-sky-300/30 bg-sky-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 backdrop-blur-xl sm:p-5">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <label className="xl:col-span-6">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Search
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5">
              <Search className="h-4 w-4 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, student ID, phone, parent phone, course"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/45 outline-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </span>
          </label>

          <label className="xl:col-span-2">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Batch
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none [&>option]:bg-slate-900"
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b === "ALL" ? "All Batches" : b}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="xl:col-span-2">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Status
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none [&>option]:bg-slate-900"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </span>
          </label>

          <label className="xl:col-span-2">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Sort
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5">
              <ArrowUpDown className="h-4 w-4 text-white/50" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none [&>option]:bg-slate-900"
              >
                <option value="NEWEST">Newest</option>
                <option value="NAME">Name (A-Z)</option>
              </select>
            </span>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 backdrop-blur-xl">
        {loading ? (
          <div className="p-5">
            <div className="grid gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/70">No students found for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Student</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Course</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Student Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Segment</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Joined</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => {
                  const group = getStudentGroup(s);

                  return (
                    <tr key={s._id} className="border-t border-white/10 transition hover:bg-white/[0.04]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.photoUrl ? (
                            <img
                              src={resolveAssetUrl(s.photoUrl)}
                              alt={s.name}
                              className="h-11 w-11 rounded-xl border border-white/15 object-cover"
                            />
                          ) : (
                            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-[10px] font-bold text-white/45">
                              NO
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">{s.name || "-"}</div>
                            <div className="mt-0.5 text-xs font-semibold tracking-wide text-white/50">{s.studentId || "-"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-white/80">{s.courseId?.title || "-"}</td>

                      <td className="px-4 py-3">
                        {s.studentNumber ? (
                          <a
                            href={`tel:${s.studentNumber}`}
                            className="text-white/80 transition hover:text-white"
                          >
                            {s.studentNumber}
                          </a>
                        ) : (
                          <span className="text-white/45">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-semibold",
                            studentGroupPill(group)
                          )}
                        >
                          {group}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-white/70">
                        {formatDate(s.joiningDate || s.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            to={`/admin/students/${s._id}/profile`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15"
                          >
                            <UserCircle2 className="h-3.5 w-3.5" />
                            Report
                          </Link>

                          <Link
                            to={`/admin/students/${s._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => askDelete(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/30 bg-rose-500/15 px-2.5 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/25"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-white/80">
        <div>
          Total students: <span className="font-semibold text-white">{pagination.total}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 20)}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white outline-none [&>option]:bg-slate-900"
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
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
            Page {pagination.page} / {pagination.totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading || !pagination.hasNext}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <ConfirmModal
        open={del.open}
        title="Delete student?"
        onClose={() => setDel({ open: false, id: "", name: "", studentId: "" })}
      >
        <div className="text-sm text-white/70">This action will permanently remove the student.</div>

        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
          <div className="flex items-center justify-between">
            <span className="text-white/55">Student</span>
            <span className="font-semibold text-white">{del.name}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/55">Student ID</span>
            <span className="font-semibold text-white">{del.studentId}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setDel({ open: false, id: "", name: "", studentId: "" })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-60"
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={doDelete}
            className="flex-1 rounded-xl bg-rose-500/85 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}
