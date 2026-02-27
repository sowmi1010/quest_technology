import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetStudents } from "../../../services/studentApi";
import { adminIssueCertificate } from "../../../services/certificateApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  User,
} from "lucide-react";

import { resolveAssetUrl } from "../../../utils/apiConfig";


function createDefaultStudentPagination() {
  return {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  };
}

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsPagination, setStudentsPagination] = useState(createDefaultStudentPagination);
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(20);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [studentQuery, setStudentQuery] = useState("");
  const [studentKeyword, setStudentKeyword] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    startDate: "",
    endDate: "",
    issueDate: "",
    performance: "Excellent",
    remarks: "",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, message: "", type }),
      2200
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStudentKeyword(studentQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [studentQuery]);

  useEffect(() => {
    setStudentPage(1);
  }, [studentKeyword, studentLimit]);

  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await adminGetStudents({
          page: studentPage,
          limit: studentLimit,
          keyword: studentKeyword || undefined,
          sort: "name:asc",
        });

        if (cancelled) return;

        const rows = res?.data?.data || [];
        const nextPagination = res?.data?.pagination || {
          page: studentPage,
          limit: studentLimit,
          total: rows.length,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
        };

        setStudents(rows);
        setStudentsPagination(nextPagination);

        if (nextPagination.page && nextPagination.page !== studentPage) {
          setStudentPage(nextPagination.page);
        }
      } catch {
        if (cancelled) return;
        setStudents([]);
        setStudentsPagination(createDefaultStudentPagination());
        showToast("Failed to load students", "error");
      } finally {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      }
    };

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [studentPage, studentLimit, studentKeyword, showToast]);

  useEffect(() => {
    if (!form.studentId) {
      setSelectedStudent(null);
      return;
    }

    const matched = students.find((x) => x._id === form.studentId);
    if (matched) {
      setSelectedStudent(matched);
    }
  }, [students, form.studentId]);

  const studentOptions = useMemo(() => {
    if (!form.studentId || !selectedStudent) return students;
    const presentInPage = students.some((x) => x._id === form.studentId);
    return presentInPage ? students : [selectedStudent, ...students];
  }, [students, form.studentId, selectedStudent]);

  const onChange = (e) =>
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  const onPickStudent = (e) => {
    const studentId = e.target.value;
    const s = studentOptions.find((x) => x._id === studentId);
    setSelectedStudent(s || null);

    setForm((p) => ({
      ...p,
      studentId,
      courseId: s?.courseId?._id || "",
    }));
  };

  const validate = () => {
    if (!form.studentId) return "Please select a student.";
    if (!form.startDate) return "Please select course start date.";
    if (!form.endDate) return "Please select course end date.";
    if (!form.issueDate) return "Please select issue date.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      showToast(err, "error");
      return;
    }

    setSaving(true);

    try {
      const res = await adminIssueCertificate(form);
      const cert = res?.data?.data;

      showToast("Certificate generated successfully", "success");

      if (cert?.pdfUrl) {
        window.open(resolveAssetUrl(cert.pdfUrl), "_blank", "noreferrer");
      }

      navigate("/admin/certificates", { replace: true });
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to generate certificate", "error");
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Generate Certificate</h1>
          <p className="mt-1 text-sm text-white/60">
            Select a student, set dates, and generate PDF certificate.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                     hover:bg-white/10 transition active:scale-[0.98]"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          {/* Student search + select */}
          <div className="grid gap-3">
            <div>
              <label className="text-xs font-semibold text-white/60">Search Student</label>
              <div className="relative mt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Type name / student id / course..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/60">Student</label>
              <select
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                           focus:ring-2 focus:ring-sky-400/40"
                value={form.studentId}
                onChange={onPickStudent}
                required
                disabled={loadingStudents}
              >
                <option value="">
                  {loadingStudents
                    ? "Loading students..."
                    : studentKeyword
                      ? "Select student (filtered)"
                      : "Select student"}
                </option>
                {studentOptions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.studentId} - {s.name} ({s.courseId?.title || "Course"})
                  </option>
                ))}
              </select>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/65">
                <div>
                  Showing{" "}
                  <span className="font-extrabold text-white">{students.length}</span> of{" "}
                  <span className="font-extrabold text-white">{studentsPagination.total}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={studentLimit}
                    onChange={(e) => setStudentLimit(Number(e.target.value) || 20)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-extrabold text-white outline-none [&>option]:bg-white [&>option]:text-slate-900"
                  >
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setStudentPage((prev) => Math.max(1, prev - 1))}
                    disabled={loadingStudents || !studentsPagination.hasPrev}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-extrabold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-extrabold text-white">
                    {studentsPagination.page} / {studentsPagination.totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStudentPage((prev) => prev + 1)}
                    disabled={loadingStudents || !studentsPagination.hasNext}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-extrabold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {!loadingStudents && students.length === 0 && (
                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  No students found for this search.
                </div>
              )}
            </div>
          </div>

          {/* Selected student card */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 border border-white/10 text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white">
                  {selectedStudent?.name || "No student selected"}
                </div>
                <div className="text-xs text-white/50">
                  {selectedStudent?.studentId ? `ID: ${selectedStudent.studentId}` : "Select a student to preview details"}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Course:{" "}
                  <span className="text-white/80 font-semibold">
                    {selectedStudent?.courseId?.title || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-white/60">Start Date</label>
              <div className="relative mt-2">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white outline-none
                             focus:ring-2 focus:ring-sky-400/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/60">End Date</label>
              <div className="relative mt-2">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white outline-none
                             focus:ring-2 focus:ring-sky-400/40"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-white/60">Issue Date</label>
            <div className="relative mt-2">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white outline-none
                           focus:ring-2 focus:ring-sky-400/40"
                required
              />
            </div>
          </div>

          {/* Performance + remarks */}
          <div className="mt-4">
            <label className="text-xs font-semibold text-white/60">Performance</label>
            <select
              name="performance"
              value={form.performance}
              onChange={onChange}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            >
              <option>Excellent</option>
              <option>Very Good</option>
              <option>Good</option>
              <option>Satisfactory</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-white/60">Remarks (optional)</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40"
              placeholder="Add any remarks..."
            />
          </div>

          {/* Submit */}
          <button
            disabled={saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <FileText className="h-5 w-5" />
            {saving ? "Generating..." : "Generate PDF Certificate"}
          </button>
        </div>

        {/* Right: Info panel */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base font-bold text-white">How it works</h2>

          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">Student data</div>
              <div className="mt-1">
                Student photo and course are taken from the student profile.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">PDF storage</div>
              <div className="mt-1">
                Generated PDF is uploaded to Cloudinary and can be opened anytime.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">Verification</div>
              <div className="mt-1">
                QR code opens the verify page using the certificate number.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">Admin access</div>
              <div className="mt-1">
                Admin can download PDFs from the certificates list anytime.
              </div>
            </div>
          </div>

          <div className="mt-5 text-xs text-white/45">
            Tip: Fill course dates properly for accurate certificate printing.
          </div>
        </div>
      </form>
    </div>
  );
}

