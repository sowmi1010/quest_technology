import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { adminCreateGallery, adminGetGallery, adminUpdateGallery } from "../../../services/galleryApi";
import { GALLERY_CATEGORY_OPTIONS } from "../../../utils/galleryCategories";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

export default function GalleryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [serverPreview, setServerPreview] = useState("");
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: GALLERY_CATEGORY_OPTIONS[0].value,
    isPublic: true,
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
        const res = await adminGetGallery(id);
        const row = res?.data?.data;

        setForm({
          title: row?.title || "",
          description: row?.description || "",
          category: row?.category || GALLERY_CATEGORY_OPTIONS[0].value,
          isPublic: Boolean(row?.isPublic ?? true),
        });

        const filePreview = row?.imageUrl ? `${API_URL}${row.imageUrl}` : "";
        setServerPreview(filePreview);
        setPreview(filePreview);
      } catch (error) {
        showToast(error?.response?.data?.message || "Failed to load gallery item", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setPreview(isEdit ? serverPreview : "");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      showToast("Category is required", "error");
      return;
    }

    if (!isEdit && !imageFile) {
      showToast("Image is required for new gallery upload", "error");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("category", form.category);
      fd.append("isPublic", String(form.isPublic));

      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        await adminUpdateGallery(id, fd, true);
      } else {
        await adminCreateGallery(fd);
      }

      showToast(isEdit ? "Gallery item updated" : "Gallery item created");
      navigate("/admin/gallery", { replace: true });
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to save gallery item", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-6 w-52 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
          <div className="h-80 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-80 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {isEdit ? "Edit Gallery Item" : "Add Gallery Item"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Upload photos and assign the right category for the public gallery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-xs font-semibold text-white/60">Title (optional)</span>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Campus Workshop Day 1"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Category</span>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
              >
                {GALLERY_CATEGORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Visibility</span>
              <span className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={onChange}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                Show on public gallery page
              </span>
            </label>
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-semibold text-white/60">Description (optional)</span>
            <textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Add short details about this activity..."
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Gallery Item"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Photo</h2>
            {imageFile && (
              <button
                type="button"
                onClick={clearImageSelection}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          <div className="mt-4">
            {preview ? (
              <img
                src={preview}
                alt="Gallery preview"
                className="h-56 w-full rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-56 w-full rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/10">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-white/70">No image selected</div>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={onPickImage}
            className="mt-4 w-full text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/15"
          />

          <p className="mt-3 text-xs text-white/45">
            JPG, PNG, or WEBP. Max size 4MB.
          </p>
        </div>
      </form>
    </div>
  );
}
