import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createFeedback, getFeedback, updateFeedback } from "../../../services/feedbackApi";
import { ArrowLeft, Image as ImageIcon, Save, Star, Trash2 } from "lucide-react";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

function StarRating({ value, onChange }) {
  const v = Number(value) || 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= v;

        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              "grid h-10 w-10 place-items-center rounded-2xl border transition active:scale-[0.98]",
              active
                ? "border-amber-200/30 bg-amber-500/15 text-amber-200"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
            ].join(" ")}
            title={`${n} star`}
          >
            <Star className={active ? "h-5 w-5 fill-current" : "h-5 w-5"} />
          </button>
        );
      })}
      <div className="ml-2 text-sm font-semibold text-white/70">{v}/5</div>
    </div>
  );
}

export default function FeedbackForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, message: "", type }),
      2200
    );
  };

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const res = await getFeedback(id);
        const d = res?.data?.data;

        setForm({
          name: d?.name || "",
          course: d?.course || "",
          feedback: d?.feedback || "",
          company: d?.company || "",
          status: d?.status || "NEW",
          rating: Number(d?.rating || 5),
        });

        setPreview(d?.imageUrl ? `${API_URL}${d.imageUrl}` : "");
      } catch {
        showToast("Failed to load feedback", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const onChange = (e) =>
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  const onChangeRating = (n) => setForm((p) => ({ ...p, rating: n }));

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Student name is required.";
    if (!form.feedback.trim()) return "Feedback text is required.";
    if (!form.rating) return "Rating is required.";
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
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) await updateFeedback(id, fd);
      else await createFeedback(fd);

      showToast(isEdit ? "Feedback updated" : "Feedback created", "success");
      navigate("/admin/feedback", { replace: true });
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const statusClass = useMemo(() => {
    const s = String(form.status || "").toLowerCase();
    if (s.includes("new")) return "border-sky-200/30 bg-sky-500/15 text-sky-200";
    if (s.includes("contact")) return "border-amber-200/30 bg-amber-500/15 text-amber-200";
    if (s.includes("plac")) return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
    return "border-white/10 bg-white/5 text-white/80";
  }, [form.status]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-80 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {isEdit ? "Edit Feedback" : "Add Feedback"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Store student feedback, rating and placement details.
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

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Student Name</span>
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Student name"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Course</span>
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                name="course"
                value={form.course}
                onChange={onChange}
                placeholder="Full Stack / Tally"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Company (Placement)</span>
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                name="company"
                value={form.company}
                onChange={onChange}
                placeholder="Company name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Status</span>
              <select
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                           focus:ring-2 focus:ring-sky-400/40"
                name="status"
                value={form.status}
                onChange={onChange}
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="PLACED">PLACED</option>
              </select>

              <div className="pt-1">
                <span className={["inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold", statusClass].join(" ")}>
                  {form.status}
                </span>
              </div>
            </label>
          </div>

          {/* Rating */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-white/60">Rating</div>
            <div className="mt-2">
              <StarRating value={form.rating} onChange={onChangeRating} />
            </div>
          </div>

          {/* Feedback */}
          <label className="mt-4 grid gap-2">
            <span className="text-xs font-semibold text-white/60">Feedback</span>
            <textarea
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
              name="feedback"
              value={form.feedback}
              onChange={onChange}
              placeholder="Write feedback..."
              rows={5}
              required
            />
          </label>

          <button
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Right Image */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Image</h2>
            {preview && (
              <button
                type="button"
                onClick={removeImage}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80
                           hover:bg-white/10 transition"
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <div className="mt-4">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-52 w-full rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-52 w-full rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/10">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-white/70">No image selected</div>
                  <div className="text-xs text-white/45">Upload student photo / certificate</div>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={onPickImage}
            className="mt-4 w-full text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white
                       hover:file:bg-white/15"
          />

          <div className="mt-3 text-xs text-white/45">
            Tip: Use clear image for testimonials section.
          </div>
        </div>
      </form>
    </div>
  );
}
