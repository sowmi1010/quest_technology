import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  adminCreateCourse,
  adminGetCourse,
  adminUpdateCourse,
} from "../../../services/courseApi";
import { api } from "../../../services/api";
import {
  ArrowLeft,
  Image as ImageIcon,
  X,
  Save,
  Tag,
  Clock,
  IndianRupee,
  Eye,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Trash2,
  BookOpen,
  FileText,
} from "lucide-react";

import { resolveAssetUrl } from "../../../utils/apiConfig";


function createEmptySyllabusItem() {
  return { title: "", type: "LESSON" };
}

function createEmptySyllabusModule(index = 1) {
  return {
    title: `Module ${index}`,
    items: [createEmptySyllabusItem()],
  };
}

function toEditableModules(value) {
  if (!Array.isArray(value)) return [];

  const modules = value
    .map((module, moduleIdx) => {
      const moduleTitle = typeof module?.title === "string" ? module.title : "";
      const items = Array.isArray(module?.items)
        ? module.items
            .map((item) => ({
              title: typeof item?.title === "string" ? item.title : "",
              type: String(item?.type || "LESSON").toUpperCase() === "PROJECT" ? "PROJECT" : "LESSON",
            }))
            .filter((item) => item.title.trim() !== "")
        : [];

      if (!moduleTitle.trim() && items.length === 0) return null;

      return {
        title: moduleTitle || `Module ${moduleIdx + 1}`,
        items: items.length > 0 ? items : [createEmptySyllabusItem()],
      };
    })
    .filter(Boolean);

  return modules;
}

function normalizeModulesForSave(modules) {
  if (!Array.isArray(modules)) return [];

  return modules
    .map((module, moduleIdx) => {
      const title = String(module?.title || "").trim();
      const items = Array.isArray(module?.items)
        ? module.items
            .map((item) => ({
              title: String(item?.title || "").trim(),
              type: String(item?.type || "LESSON").toUpperCase() === "PROJECT" ? "PROJECT" : "LESSON",
            }))
            .filter((item) => item.title !== "")
        : [];

      if (!title && items.length === 0) return null;

      return {
        title: title || `Module ${moduleIdx + 1}`,
        items,
      };
    })
    .filter(Boolean);
}

function moduleLessonCount(module) {
  if (!Array.isArray(module?.items)) return 0;
  return module.items.filter((item) => String(item?.title || "").trim() !== "").length;
}

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
    isPublic: true,
  });

  const [syllabusModules, setSyllabusModules] = useState([createEmptySyllabusModule(1)]);
  const [expandedModuleIndex, setExpandedModuleIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [categoriesMsg, setCategoriesMsg] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, message: "", type }),
      2200
    );
  };

  const syllabusSummary = useMemo(() => {
    const cleanModules = normalizeModulesForSave(syllabusModules);
    const topicCount = cleanModules.reduce((sum, module) => sum + module.items.length, 0);

    return {
      moduleCount: cleanModules.length,
      topicCount,
    };
  }, [syllabusModules]);

  const loadCategories = async () => {
    try {
      setCategoriesMsg("");
      const res = await api.get("/categories");
      const list = res?.data?.data || [];
      setCategories(list);
      if (list.length === 0) setCategoriesMsg("No categories found. Create category first.");
    } catch {
      setCategories([]);
      setCategoriesMsg("Unable to load categories.");
    }
  };

  const loadCourse = async () => {
    if (!isEdit) return;

    const res = await adminGetCourse(id);
    const c = res?.data?.data;

    setForm({
      title: c?.title || "",
      categoryId: c?.categoryId?._id || c?.categoryId || "",
      duration: c?.duration || "",
      totalFee: String(c?.totalFee ?? ""),
      installmentStart: String(c?.installmentStart ?? 5000),
      isPublic: !!c?.isPublic,
    });

    const structured = toEditableModules(c?.syllabusModules);
    const legacy = Array.isArray(c?.syllabus)
      ? [
          {
            title: "Module 1",
            items: c.syllabus
              .map((topic) => String(topic || "").trim())
              .filter(Boolean)
              .map((title) => ({ title, type: "LESSON" })),
          },
        ].filter((module) => module.items.length > 0)
      : [];

    const nextModules = structured.length > 0
      ? structured
      : legacy.length > 0
        ? legacy
        : [createEmptySyllabusModule(1)];

    setSyllabusModules(nextModules);
    setExpandedModuleIndex(0);

    setPreview(resolveAssetUrl(c?.imageUrl || ""));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadCategories();
        await loadCourse();
      } catch {
        showToast("Failed to load form data", "error");
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

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
  };

  const addModule = () => {
    setSyllabusModules((prev) => {
      const next = [...prev, createEmptySyllabusModule(prev.length + 1)];
      setExpandedModuleIndex(next.length - 1);
      return next;
    });
  };

  const removeModule = (moduleIdx) => {
    setSyllabusModules((prev) => {
      const next = prev.filter((_, idx) => idx !== moduleIdx);
      return next.length > 0 ? next : [createEmptySyllabusModule(1)];
    });

    setExpandedModuleIndex((prev) => {
      if (prev === moduleIdx) return 0;
      if (prev > moduleIdx) return prev - 1;
      return prev;
    });
  };

  const updateModuleField = (moduleIdx, field, value) => {
    setSyllabusModules((prev) =>
      prev.map((module, idx) =>
        idx === moduleIdx ? { ...module, [field]: value } : module
      )
    );
  };

  const addItem = (moduleIdx) => {
    setSyllabusModules((prev) =>
      prev.map((module, idx) =>
        idx === moduleIdx
          ? { ...module, items: [...(module.items || []), createEmptySyllabusItem()] }
          : module
      )
    );
  };

  const updateItem = (moduleIdx, itemIdx, field, value) => {
    setSyllabusModules((prev) =>
      prev.map((module, idx) => {
        if (idx !== moduleIdx) return module;

        const nextItems = (module.items || []).map((item, innerIdx) =>
          innerIdx === itemIdx ? { ...item, [field]: value } : item
        );

        return { ...module, items: nextItems };
      })
    );
  };

  const removeItem = (moduleIdx, itemIdx) => {
    setSyllabusModules((prev) =>
      prev.map((module, idx) => {
        if (idx !== moduleIdx) return module;

        const nextItems = (module.items || []).filter((_, innerIdx) => innerIdx !== itemIdx);
        return {
          ...module,
          items: nextItems.length > 0 ? nextItems : [createEmptySyllabusItem()],
        };
      })
    );
  };

  const validate = () => {
    if (!form.title.trim()) return "Course title is required.";
    if (!form.categoryId || form.categoryId.length < 10) return "Please select a valid category.";
    if (!form.duration.trim()) return "Duration is required.";
    if (!String(form.totalFee).trim()) return "Total fee is required.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      showToast(err, "error");
      return;
    }

    if (categories.length === 0) {
      showToast("Please create a category first.", "error");
      return;
    }

    setSaving(true);

    try {
      const cleanModules = normalizeModulesForSave(syllabusModules);
      const flatTopics = cleanModules.flatMap((module) => module.items.map((item) => item.title));

      // Build FormData for multer
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("categoryId", form.categoryId);
      fd.append("duration", form.duration);
      fd.append("totalFee", form.totalFee);
      fd.append("installmentStart", form.installmentStart);
      fd.append("syllabus", flatTopics.join(", "));
      fd.append("syllabusModules", JSON.stringify(cleanModules));
      fd.append("isPublic", String(form.isPublic));
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) await adminUpdateCourse(id, fd);
      else await adminCreateCourse(fd);

      showToast(isEdit ? "Course updated" : "Course created", "success");
      navigate("/admin/courses", { replace: true });
    } catch (error) {
      const serverMsg = error?.response?.data?.message || "Save failed";
      showToast(serverMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-6 w-52 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
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
            {isEdit ? "Edit Course" : "Add Course"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Manage course details, pricing, syllabus and visibility.
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
        {/* Left: Details */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="grid gap-4">
            {/* Title */}
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Course Title</span>
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                           focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                placeholder="Full Stack / AWS / Tally"
                name="title"
                value={form.title}
                onChange={onChange}
                required
              />
            </label>

            {/* Category */}
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Category</span>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <select
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 pl-12 pr-10 py-3 text-sm text-white outline-none
                             focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
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
              </div>
              {categoriesMsg && <div className="text-sm text-rose-200">{categoriesMsg}</div>}
            </label>

            {/* Duration */}
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Duration</span>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                  placeholder="45 Days / 3 Months"
                  name="duration"
                  value={form.duration}
                  onChange={onChange}
                  required
                />
              </div>
            </label>

            {/* Fees */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-white/60">Total Fee</span>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                               focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                    placeholder="25000"
                    name="totalFee"
                    value={form.totalFee}
                    onChange={onChange}
                    required
                    inputMode="numeric"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold text-white/60">Installment Start</span>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                               focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                    placeholder="5000"
                    name="installmentStart"
                    value={form.installmentStart}
                    onChange={onChange}
                    inputMode="numeric"
                  />
                </div>
              </label>
            </div>

            {/* Syllabus Builder */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
                    Structured Syllabus
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    Create modules and add lessons or projects.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:bg-white/10 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Module
                </button>
              </div>

              <div className="mt-3 text-xs text-white/50">
                {syllabusSummary.moduleCount} modules, {syllabusSummary.topicCount} syllabus items
              </div>

              <div className="mt-3 space-y-3">
                {syllabusModules.map((module, moduleIdx) => {
                  const isOpen = expandedModuleIndex === moduleIdx;
                  const lessonCount = moduleLessonCount(module);

                  return (
                    <div key={`module-${moduleIdx}`} className="rounded-2xl border border-white/10 bg-slate-950/20">
                      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setExpandedModuleIndex(isOpen ? -1 : moduleIdx)}
                          className="inline-flex flex-1 items-center gap-2 text-left"
                        >
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-white/60" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-white/60" />
                          )}
                          <span className="text-sm font-semibold text-white">
                            {module.title?.trim() || `Module ${moduleIdx + 1}`}
                          </span>
                        </button>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/65">
                          {lessonCount} items
                        </span>

                        <button
                          type="button"
                          onClick={() => removeModule(moduleIdx)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-300/25 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-200 hover:bg-rose-500/15 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>

                      {isOpen && (
                        <div className="space-y-3 p-3">
                          <label className="grid gap-1">
                            <span className="text-[11px] font-semibold text-white/60">Module Title</span>
                            <input
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40"
                              placeholder={`Module ${moduleIdx + 1}`}
                              value={module.title}
                              onChange={(e) => updateModuleField(moduleIdx, "title", e.target.value)}
                            />
                          </label>

                          <div className="space-y-2">
                            {module.items?.map((item, itemIdx) => {
                              const isProject = item.type === "PROJECT";
                              return (
                                <div
                                  key={`module-${moduleIdx}-item-${itemIdx}`}
                                  className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-2 sm:grid-cols-[minmax(0,1fr)_130px_auto]"
                                >
                                  <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
                                      {isProject ? <FileText className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                                    </span>
                                    <input
                                      className="w-full rounded-xl border border-white/10 bg-slate-950/20 pl-10 pr-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40"
                                      placeholder="Lesson or project name"
                                      value={item.title}
                                      onChange={(e) => updateItem(moduleIdx, itemIdx, "title", e.target.value)}
                                    />
                                  </div>

                                  <select
                                    value={item.type}
                                    onChange={(e) => updateItem(moduleIdx, itemIdx, "type", e.target.value)}
                                    className="rounded-xl border border-white/10 bg-slate-950/20 px-3 py-2 text-xs font-bold text-white outline-none [&>option]:bg-white [&>option]:text-slate-900"
                                  >
                                    <option value="LESSON">LESSON</option>
                                    <option value="PROJECT">PROJECT</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => removeItem(moduleIdx, itemIdx)}
                                    className="inline-flex items-center justify-center rounded-xl border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/15 transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => addItem(moduleIdx)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Item
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Public toggle */}
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-white/80">
                <Eye className="h-5 w-5 text-white/50" />
                <div>
                  <div className="text-sm font-semibold text-white">Public Visibility</div>
                  <div className="text-xs text-white/50">Show this course in public website</div>
                </div>
              </div>

              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={onChange}
                className="h-5 w-5 accent-sky-400"
              />
            </label>
          </div>
        </div>

        {/* Right: Image + Save */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Course Image</h2>
            {preview && (
              <button
                type="button"
                onClick={removeImage}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80
                           hover:bg-white/10 transition"
                title="Remove preview"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <div className="mt-4">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-44 w-full rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-44 w-full rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/10">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-white/70">No image selected</div>
                  <div className="text-xs text-white/45">PNG / JPG / WEBP</div>
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

          <button
            disabled={saving || categories.length === 0}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
          </button>

          <div className="mt-4 text-xs text-white/45">
            Tip: Use a clear course banner image for better public listing.
          </div>
        </div>
      </form>
    </div>
  );
}

