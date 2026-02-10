import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminCreateCourse, adminGetCourse, adminUpdateCourse } from "../../../services/courseApi";
import { api } from "../../../services/api";

export default function CourseForm() {
  const { id } = useParams(); // "new" OR courseId
  const isEdit = id && id !== "new";
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    duration: "",
    totalFee: "",
    installmentStart: "5000",
    syllabus: "",
    isPublic: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [categoriesMsg, setCategoriesMsg] = useState("");

  const loadCategories = async () => {
    try {
      setCategoriesMsg("");
      const res = await api.get("/categories");
      const list = res.data.data || [];
      setCategories(list);
      if (list.length === 0) {
        setCategoriesMsg("No categories found. Create category first.");
      }
    } catch {
      setCategories([]);
      setCategoriesMsg("Unable to load categories.");
    }
  };

  const loadCourse = async () => {
    if (!isEdit) return;
    const res = await adminGetCourse(id);
    const c = res.data.data;

    setForm({
      title: c.title || "",
      categoryId: c.categoryId?._id || c.categoryId || "",
      duration: c.duration || "",
      totalFee: String(c.totalFee ?? ""),
      installmentStart: String(c.installmentStart ?? 5000),
      syllabus: (c.syllabus || []).join(", "),
      isPublic: !!c.isPublic,
    });

    setPreview(c.imageUrl ? `http://localhost:5000${c.imageUrl}` : "");
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");
      try {
        await loadCategories();
        await loadCourse();
      } catch {
        setMsg("❌ Failed to load form data");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    if (!form.categoryId || form.categoryId.length < 10) {
      setMsg("Invalid category selected. Please choose a valid category.");
      setSaving(false);
      return;
    }

    try {
      // Build FormData for multer
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("categoryId", form.categoryId);
      fd.append("duration", form.duration);
      fd.append("totalFee", form.totalFee);
      fd.append("installmentStart", form.installmentStart);
      fd.append("syllabus", form.syllabus);
      fd.append("isPublic", String(form.isPublic));
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        await adminUpdateCourse(id, fd);
      } else {
        await adminCreateCourse(fd);
      }

      navigate("/admin/courses", { replace: true });
    } catch (err) {
      const serverMsg = err?.response?.data?.message || "Save failed";
      setMsg(`❌ ${serverMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">
          {isEdit ? "Edit Course" : "Add Course"}
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
            <input
              className="border rounded-xl p-3"
              placeholder="Course Title (Full Stack / AWS / Tally)"
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />

            <select
              className="border rounded-xl p-3"
              name="categoryId"
              value={form.categoryId}
              onChange={onChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categoriesMsg && (
              <div className="text-sm text-red-600">{categoriesMsg}</div>
            )}

            <input
              className="border rounded-xl p-3"
              placeholder="Duration (ex: 45 Days / 3 Months)"
              name="duration"
              value={form.duration}
              onChange={onChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="border rounded-xl p-3"
                placeholder="Total Fee (ex: 25000)"
                name="totalFee"
                value={form.totalFee}
                onChange={onChange}
                required
              />
              <input
                className="border rounded-xl p-3"
                placeholder="Installment Start (default 5000)"
                name="installmentStart"
                value={form.installmentStart}
                onChange={onChange}
              />
            </div>

            <textarea
              className="border rounded-xl p-3"
              placeholder="Syllabus (comma separated) ex: HTML,CSS,JS,React"
              name="syllabus"
              value={form.syllabus}
              onChange={onChange}
              rows={4}
            />

            <label className="flex items-center gap-2 text-sm text-peacock-navy">
              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={onChange}
              />
              Show in Public Website
            </label>
          </div>
        </div>

        {/* Right: Image */}
        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <h2 className="font-semibold text-peacock-navy">Course Image</h2>

          <div className="mt-3">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-40 object-cover rounded-xl border"
              />
            ) : (
              <div className="w-full h-40 rounded-xl bg-peacock-bg border border-peacock-border flex items-center justify-center text-gray-500 text-sm">
                No image selected
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={onPickImage}
            className="mt-3 w-full text-sm"
          />

          <button
            disabled={saving || categories.length === 0}
            className="mt-4 w-full bg-peacock-blue text-white rounded-xl p-3 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
          </button>

          {msg && (
            <div className="mt-3 text-sm font-medium bg-peacock-bg border border-peacock-border rounded-xl p-3">
              {msg}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
