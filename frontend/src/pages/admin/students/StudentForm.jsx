import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGetCourses } from "../../../services/courseApi";
import {
  adminCreateStudent,
  adminGetStudent,
  adminUpdateStudent,
} from "../../../services/studentApi";

export default function StudentForm() {
  const { id } = useParams(); // optional
  const isEdit = !!id;
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [preview, setPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    courseId: "",
    fatherName: "",
    fatherNumber: "",
    studentNumber: "",
    address: "",
    joiningDate: "",
    batchType: "Mon/Wed/Fri",
    status: "ACTIVE",
  });

  useEffect(() => {
    (async () => {
      try {
        const cRes = await adminGetCourses();
        setCourses(cRes.data.data || []);
      } catch {
        setCourses([]);
      }

      if (isEdit) {
        try {
          const sRes = await adminGetStudent(id);
          const s = sRes.data.data;

          setForm({
            name: s.name || "",
            courseId: s.courseId?._id || s.courseId || "",
            fatherName: s.fatherName || "",
            fatherNumber: s.fatherNumber || "",
            studentNumber: s.studentNumber || "",
            address: s.address || "",
            joiningDate: s.joiningDate ? new Date(s.joiningDate).toISOString().slice(0, 10) : "",
            batchType: s.batchType || "Mon/Wed/Fri",
            status: s.status || "ACTIVE",
          });

          setPreview(s.photoUrl ? `http://localhost:5000${s.photoUrl}` : "");
        } catch {
          setMsg("❌ Failed to load student");
        }
      }
    })();
  }, [id, isEdit]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("photo", photoFile);

      if (isEdit) await adminUpdateStudent(id, fd);
      else await adminCreateStudent(fd);

      navigate("/admin/students", { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">
          {isEdit ? "Edit Student" : "Add Student"}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl border border-peacock-border bg-white"
        >
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-peacock-border p-6">
          <div className="grid gap-3">
            <input className="border rounded-xl p-3" placeholder="Student Name"
              name="name" value={form.name} onChange={onChange} required />

            <select className="border rounded-xl p-3"
              name="courseId" value={form.courseId} onChange={onChange} required>
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.duration})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border rounded-xl p-3" placeholder="Father Name"
                name="fatherName" value={form.fatherName} onChange={onChange} />
              <input className="border rounded-xl p-3" placeholder="Father Number"
                name="fatherNumber" value={form.fatherNumber} onChange={onChange} />
            </div>

            <input className="border rounded-xl p-3" placeholder="Student Number"
              name="studentNumber" value={form.studentNumber} onChange={onChange} />

            <textarea className="border rounded-xl p-3" placeholder="Address"
              name="address" value={form.address} onChange={onChange} rows={3} />
          </div>
        </div>

        {/* Right */}
        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <h2 className="font-semibold text-peacock-navy">Photo & Batch</h2>

          <div className="mt-3">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-xl border" />
            ) : (
              <div className="w-full h-40 rounded-xl bg-peacock-bg border border-peacock-border flex items-center justify-center text-gray-500 text-sm">
                No photo selected
              </div>
            )}
          </div>

          <input type="file" accept="image/*" onChange={onPickPhoto} className="mt-3 w-full text-sm" />

          <div className="mt-4">
            <label className="text-xs text-gray-500">Batch Type</label>
            <select className="mt-1 w-full border rounded-xl p-3"
              name="batchType" value={form.batchType} onChange={onChange}>
              <option>Mon/Wed/Fri</option>
              <option>Tue/Thu/Sat</option>
              <option>Weekdays + Sunday</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="text-xs text-gray-500">Joining Date</label>
            <input type="date" className="mt-1 w-full border rounded-xl p-3"
              name="joiningDate" value={form.joiningDate} onChange={onChange} />
          </div>

          {isEdit && (
            <div className="mt-3">
              <label className="text-xs text-gray-500">Status</label>
              <select className="mt-1 w-full border rounded-xl p-3"
                name="status" value={form.status} onChange={onChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <button disabled={saving}
            className="mt-4 w-full bg-peacock-blue text-white rounded-xl p-3 font-semibold hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update Student" : "Add Student"}
          </button>

          {msg && (
            <div className="mt-3 text-sm font-medium bg-peacock-bg border border-peacock-border rounded-xl p-3">
              ❌ {msg}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Photo will help for certificate generation.
          </div>
        </div>
      </form>
    </div>
  );
}
