import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  User,
  CalendarDays,
  CreditCard,
  Activity,
} from "lucide-react";

import { adminGetStudent } from "../../../../services/studentApi";
import AttendanceCalendar from "./components/AttendanceCalendar";
import PaymentsTab from "./components/PaymentsTab";
import PerformanceTab from "./components/PerformanceTab";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

const TABS = [
  { key: "attendance", label: "Attendance", icon: CalendarDays },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "performance", label: "Performance", icon: Activity },
  { key: "overview", label: "Overview", icon: User },
];

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("attendance");

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetStudent(id);
      setStudent(res?.data?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const photo = useMemo(() => {
    if (!student?.photoUrl) return "";
    return `${API_URL}${student.photoUrl}`;
  }, [student]);

  if (loading) return <StudentProfileSkeleton />;

  if (!student) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur-xl">
          Student not found
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
      {/* Premium Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl"
      >
        {/* soft glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {photo ? (
              <img
                src={photo}
                alt={student.name}
                className="h-16 w-16 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/10 grid place-items-center text-xs font-bold text-white/50">
                No Photo
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-white/50">
                {student.studentId}
              </div>

              <h1 className="mt-1 text-2xl font-extrabold text-white">
                {student.name}
              </h1>

              <div className="mt-1 text-sm text-white/65">
                Course:{" "}
                <span className="font-bold text-white">
                  {student.courseId?.title || "-"}
                </span>{" "}
                <span className="text-white/35">•</span>{" "}
                Batch:{" "}
                <span className="font-bold text-white">
                  {student.batchType || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/students"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>

            <Link
              to={`/admin/students/${student._id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                         shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                         transition hover:brightness-110 active:scale-[0.98]"
            >
              <Pencil className="h-5 w-5" />
              Edit
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <PremiumTab
                key={t.key}
                active={tab === t.key}
                onClick={() => setTab(t.key)}
                icon={t.icon}
                label={t.label}
              />
            ))}
          </div>

          {/* underline */}
          <div className="mt-3 h-px w-full bg-white/10" />
        </div>
      </motion.div>

      {/* Body */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          >
            {tab === "attendance" && <AttendanceCalendar studentId={student._id} />}
            {tab === "payments" && <PaymentsTab studentId={student._id} />}
            {tab === "performance" && <PerformanceTab studentId={student._id} />}
            {tab === "overview" && <Overview student={student} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PremiumTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition active:scale-[0.98]",
        active
          ? "border-sky-200/25 bg-sky-500/15 text-white"
          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
      ].join(" ")}
    >
      <Icon className="h-5 w-5" />
      {label}
      {active && (
        <motion.span
          layoutId="tab-underline"
          className="absolute -bottom-[7px] left-3 right-3 h-[3px] rounded-full bg-sky-400/80"
        />
      )}
    </button>
  );
}

function Overview({ student }) {
  const joiningDate = student.joiningDate
    ? new Date(student.joiningDate).toLocaleDateString()
    : "-";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl">
      <div className="text-base font-extrabold text-white">Student Details</div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Info label="Father Name" value={student.fatherName} />
        <Info label="Father Number" value={student.fatherNumber} />
        <Info label="Student Number" value={student.studentNumber} />
        <Info label="Status" value={student.status} />
        <Info label="Joining Date" value={joiningDate} />
        <Info label="Address" value={student.address} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-white/55">{label}</div>
      <div className="mt-1 font-extrabold text-white break-words">
        {value || "-"}
      </div>
    </div>
  );
}

function StudentProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 animate-pulse" />
          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
            <div className="mt-3 h-6 w-64 rounded bg-white/10 animate-pulse" />
            <div className="mt-3 h-4 w-80 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="hidden sm:flex gap-2">
            <div className="h-12 w-24 rounded-2xl bg-white/10 animate-pulse" />
            <div className="h-12 w-24 rounded-2xl bg-white/10 animate-pulse" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-36 rounded-2xl bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
