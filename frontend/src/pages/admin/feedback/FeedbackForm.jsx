import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createFeedback, getFeedback, updateFeedback } from "../../../services/feedbackApi";

export default function FeedbackForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    course: "",
    feedback: "",
    company: "",
    status: "NEW",
    rating: 5,
  });

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const res = await getFeedback(id);
        const d = res.data.data;

        setForm({
          name: d.name || "",
          course: d.course || "",
          feedback: d.feedback || "",
          company: d.company || "",
          status: d.status || "NEW",
          rating: d.rating || 5,
        });

        setPreview(d.imageUrl ? `http://localhost:5000${d.imageUrl}` : "");
      } catch {
        setMsg("❌ Failed to load feedback");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) await updateFeedback(id, fd);
      else await createFeedback(fd);

      navigate("/admin/feedback", { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">
          {isEdit ? "Edit Feedback" : "Add Feedback"}
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl border border-peacock-border bg-white font-semibold"
        >
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-peacock-border p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="border rounded-xl p-3"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Student Name"
              required
            />

            <input
              className="border rounded-xl p-3"
              name="course"
              value={form.course}
              onChange={onChange}
              placeholder="Course (ex: Full Stack / Tally)"
            />

            <input
              className="border rounded-xl p-3"
              name="company"
              value={form.company}
              onChange={onChange}
              placeholder="Company (Placement)"
            />

            <select
              className="border rounded-xl p-3 bg-white"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="PLACED">PLACED</option>
            </select>

            <select
              className="border rounded-xl p-3 bg-white"
              name="rating"
              value={form.rating}
              onChange={onChange}
            >
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>

          <textarea
            className="mt-3 border rounded-xl p-3 w-full"
            name="feedback"
            value={form.feedback}
            onChange={onChange}
            placeholder="Feedback..."
            rows={4}
            required
          />

          <button
            disabled={saving}
            className="mt-4 px-5 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {msg && (
            <div className="mt-3 text-sm font-medium bg-peacock-bg border border-peacock-border rounded-xl p-3">
              {msg}
            </div>
          )}
        </div>

        {/* Right (Image) */}
        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <h2 className="font-semibold text-peacock-navy">Image</h2>

          <div className="mt-3">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl border" />
            ) : (
              <div className="w-full h-48 rounded-xl bg-peacock-bg border border-peacock-border flex items-center justify-center text-gray-500 text-sm">
                No image
              </div>
            )}
          </div>

          <input type="file" accept="image/*" onChange={onPickImage} className="mt-3 w-full text-sm" />
          <div className="mt-2 text-xs text-gray-500">Upload student photo / certificate / any image.</div>
        </div>
      </form>
    </div>
  );
}
