import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminGetStudent } from "../../../../services/studentApi";
import AttendanceCalendar from "./components/AttendanceCalendar";
import PaymentsTab from "./components/PaymentsTab";
import InstallmentScheduleTab from "./components/InstallmentScheduleTab";

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // tabs
  const [tab, setTab] = useState("attendance"); // attendance | overview

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminGetStudent(id);
        setStudent(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const photo = useMemo(() => {
    if (!student?.photoUrl) return "";
    return `http://localhost:5000${student.photoUrl}`;
  }, [student]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!student) return <div className="p-6">Student not found</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-peacock-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {photo ? (
              <img
                src={photo}
                alt={student.name}
                className="h-16 w-16 rounded-full object-cover border"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-peacock-bg border border-peacock-border flex items-center justify-center text-gray-500">
                No
              </div>
            )}

            <div>
              <div className="text-xs text-gray-500">{student.studentId}</div>
              <h1 className="text-2xl font-bold text-peacock-navy">
                {student.name}
              </h1>
              <div className="text-sm text-gray-600 mt-1">
                Course: <b>{student.courseId?.title || "-"}</b> • Batch:{" "}
                <b>{student.batchType || "-"}</b>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/students"
              className="px-4 py-2 rounded-xl border border-peacock-border bg-white font-semibold"
            >
              Back
            </Link>

            {/* Keep your existing edit page */}
            <Link
              to={`/admin/students/${student._id}`}
              className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <TabButton
            active={tab === "attendance"}
            onClick={() => setTab("attendance")}
          >
            📅 Attendance
          </TabButton>

          <TabButton
            active={tab === "payments"}
            onClick={() => setTab("payments")}
          >
            💳 Payments
          </TabButton>

          <TabButton
            active={tab === "overview"}
            onClick={() => setTab("overview")}
          >
            👤 Overview
          </TabButton>
          <TabButton
            active={tab === "schedule"}
            onClick={() => setTab("schedule")}
          >
            📆 Schedule
          </TabButton>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4">
        {tab === "attendance" && <AttendanceCalendar studentId={student._id} />}
        {tab === "payments" && <PaymentsTab studentId={student._id} />}
        {tab === "overview" && <Overview student={student} />}
        {tab === "schedule" && <InstallmentScheduleTab studentId={student._id} />}

      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold border transition ${
        active
          ? "bg-peacock-blue text-white border-peacock-blue"
          : "bg-white border-peacock-border text-peacock-navy hover:bg-peacock-bg"
      }`}
    >
      {children}
    </button>
  );
}

function Overview({ student }) {
  return (
    <div className="bg-white rounded-2xl border border-peacock-border p-6">
      <h2 className="font-bold text-peacock-navy">Student Details</h2>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Box label="Father Name" value={student.fatherName} />
        <Box label="Father Number" value={student.fatherNumber} />
        <Box label="Student Number" value={student.studentNumber} />
        <Box label="Status" value={student.status} />
        <Box
          label="Joining Date"
          value={
            student.joiningDate
              ? new Date(student.joiningDate).toLocaleDateString()
              : "-"
          }
        />
        <Box label="Address" value={student.address} />
      </div>
    </div>
  );
}

function Box({ label, value }) {
  return (
    <div className="rounded-xl border border-peacock-border p-3 bg-peacock-bg">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-peacock-navy break-words">
        {value || "-"}
      </div>
    </div>
  );
}
