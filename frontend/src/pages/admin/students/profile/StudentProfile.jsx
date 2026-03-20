import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Pencil,
  RefreshCcw,
  User,
} from "lucide-react";

import { adminGetStudentMaster } from "../../../../services/studentApi";
import { resolveAssetUrl } from "../../../../utils/apiConfig";
import AttendanceCalendar from "./components/AttendanceCalendar";
import PaymentsTab from "./components/PaymentsTab";
import PerformanceTab from "./components/PerformanceTab";

const MASTER_TABS = [
  {
    key: "PAYMENTS",
    label: "Payments",
    icon: CreditCard,
    description: "Fee entries, balance and payment history",
  },
  {
    key: "ATTENDANCE",
    label: "Attendance",
    icon: CalendarDays,
    description: "Monthly attendance marking and summary",
  },
  {
    key: "PERFORMANCE",
    label: "Performance",
    icon: Activity,
    description: "Tool-wise progress and mentor updates",
  },
];

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

function displayValue(value) {
  if (value === 0) return "0";
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text || "-";
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{displayValue(value)}</div>
    </div>
  );
}

function MasterTabButton({ tab, active, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-sky-300/30 bg-sky-500/20 text-white"
          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-semibold">{tab.label}</span>
      </div>
      <div className="mt-1 text-xs text-white/55">{tab.description}</div>
    </button>
  );
}

function StudentProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-7 w-64 animate-pulse rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="h-14 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("PAYMENTS");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await adminGetStudentMaster(id);
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
  }, [id]);

  const student = payload?.student || null;

  const photoUrl = useMemo(() => {
    return resolveAssetUrl(student?.photoUrl || "");
  }, [student?.photoUrl]);

  const activeTabMeta = useMemo(() => {
    return MASTER_TABS.find((tab) => tab.key === activeTab) || MASTER_TABS[0];
  }, [activeTab]);

  if (loading && !payload) return <StudentProfileSkeleton />;

  if (!student) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur-xl">
        {error || "Student not found"}

        <div className="mt-4">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3 sm:items-center">


            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.name}
                className="h-14 w-14 rounded-xl border border-white/10 object-cover"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/10 text-[10px] font-bold text-white/45">
                NO
              </div>
            )}

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                {displayValue(student.studentId)}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-white">Student Master Report</h1>
              <p className="mt-1 text-sm text-white/65">
                {displayValue(student.name)}
                <span className="mx-2 text-white/35">|</span>
                {displayValue(student.courseId?.title)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to={`/admin/students/${student._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Pencil className="h-4 w-4" />
              Edit Student
            </Link>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p> : null}
      </motion.section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex items-center gap-2 text-white">
          <User className="h-4 w-4 text-white/80" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">Student Info</h2>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Student ID" value={student.studentId} />
          <InfoCard label="Student Name" value={student.name} />
          <InfoCard label="Status" value={student.status} />
          <InfoCard label="Course" value={student.courseId?.title} />
          <InfoCard label="Duration" value={student.courseId?.duration} />
          <InfoCard label="Joining Date" value={formatDate(student.joiningDate)} />
          <InfoCard label="Student Number" value={student.studentNumber} />
          <InfoCard label="Father Name" value={student.fatherName} />
          <InfoCard label="Father Number" value={student.fatherNumber} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 backdrop-blur-xl sm:p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Master Tabs</div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MASTER_TABS.map((tab) => (
            <MasterTabButton
              key={tab.key}
              tab={tab}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        <p className="mt-3 text-sm text-white/65">
          Current tab: <span className="font-semibold text-white">{activeTabMeta.label}</span>
        </p>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "PAYMENTS" ? <PaymentsTab studentId={student._id} /> : null}
          {activeTab === "ATTENDANCE" ? <AttendanceCalendar studentId={student._id} /> : null}
          {activeTab === "PERFORMANCE" ? <PerformanceTab studentId={student._id} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
