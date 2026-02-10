import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetStudents } from "../../../services/studentApi";
import { adminIssueCertificate } from "../../../services/certificateApi";

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    startDate: "",
    endDate: "",
    issueDate: "",
    performance: "Excellent",
    remarks: "",
  });

  useEffect(() => {
    (async () => {
      const res = await adminGetStudents();
      setStudents(res.data.data || []);
    })();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onPickStudent = (e) => {
    const studentId = e.target.value;
    const s = students.find((x) => x._id === studentId);
    setForm((p) => ({
      ...p,
      studentId,
      courseId: s?.courseId?._id || "",
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const res = await adminIssueCertificate(form);
      const cert = res.data.data;
      setMsg("✅ Certificate generated!");

      // open pdf directly
      window.open(`http://localhost:5000${cert.pdfUrl}`, "_blank");

      navigate("/admin/certificates", { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to generate certificate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">Generate Certificate</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl border border-peacock-border bg-white"
        >
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="mt-1 w-full border rounded-xl p-3"
            value={form.studentId}
            onChange={onPickStudent}
            required
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.studentId} - {s.name} ({s.courseId?.title || "Course"})
              </option>
            ))}
          </select>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={onChange}
                className="mt-1 w-full border rounded-xl p-3" />
            </div>
            <div>
              <label className="text-xs text-gray-500">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={onChange}
                className="mt-1 w-full border rounded-xl p-3" />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs text-gray-500">Issue Date</label>
            <input type="date" name="issueDate" value={form.issueDate} onChange={onChange}
              className="mt-1 w-full border rounded-xl p-3" />
          </div>

          <div className="mt-3">
            <label className="text-xs text-gray-500">Performance</label>
            <select
              name="performance"
              value={form.performance}
              onChange={onChange}
              className="mt-1 w-full border rounded-xl p-3"
            >
              <option>Excellent</option>
              <option>Very Good</option>
              <option>Good</option>
              <option>Satisfactory</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="text-xs text-gray-500">Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              rows={3}
              className="mt-1 w-full border rounded-xl p-3"
              placeholder="Optional remarks"
            />
          </div>

          <button
            disabled={saving}
            className="mt-4 w-full bg-peacock-blue text-white rounded-xl p-3 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Generating..." : "Generate PDF Certificate"}
          </button>

          {msg && (
            <div className="mt-3 text-sm font-medium bg-peacock-bg border border-peacock-border rounded-xl p-3">
              {msg}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <h2 className="font-semibold text-peacock-navy">How it works</h2>
          <ul className="mt-3 text-sm text-gray-700 list-disc pl-6">
            <li>Student photo is taken from student profile.</li>
            <li>PDF gets saved in backend uploads folder.</li>
            <li>QR code opens verify page with certificate number.</li>
            <li>Admin can download anytime from certificates list.</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
