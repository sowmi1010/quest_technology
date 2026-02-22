import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  UserRound,
  GraduationCap,
  Phone,
  Home,
  CalendarDays,
  Users,
  Image as ImageIcon,
  Save,
  RefreshCcw,
  X,
} from "lucide-react";

import { adminGetCourses } from "../../../services/courseApi";
import {
  adminCreateStudent,
  adminGetStudent,
  adminUpdateStudent,
} from "../../../services/studentApi";

import { resolveAssetUrl } from "../../../utils/apiConfig";


function clsx(...a) {
  return a.filter(Boolean).join(" ");
}

function getCourseCategoryId(course) {
  if (!course?.categoryId) return "";
  if (typeof course.categoryId === "object") return String(course.categoryId._id || "");
  return String(course.categoryId || "");
}

function getCourseCategoryName(course) {
  if (!course?.categoryId) return "";
  if (typeof course.categoryId === "object") return String(course.categoryId.name || "");
  return "";
}

function Card({ children, className = "" }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div className="text-xs font-semibold text-white/55">{children}</div>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none",
        "focus:ring-2 focus:ring-sky-400/40",
        className
      )}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none",
        "focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900",
        className
      )}
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none",
        "focus:ring-2 focus:ring-sky-400/40",
        className
      )}
    />
  );
}

function Toast({ show, type, message, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed right-4 top-4 z-50"
          initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
        >
          <div
            className={clsx(
              "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl",
              type === "success"
                ? "border-emerald-200/40 bg-emerald-50/80 text-emerald-900"
                : "border-rose-200/40 bg-rose-50/80 text-rose-900"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-sm font-semibold">{message}</div>
              <button
                type="button"
                onClick={onClose}
                className="ml-auto grid h-8 w-8 place-items-center rounded-xl border border-black/10 bg-black/5 hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, type: "error", message: "" });

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

  const categories = useMemo(() => {
    const byId = new Map();
    for (const c of courses) {
      const categoryId = getCourseCategoryId(c);
      if (!categoryId) continue;
      const categoryName = getCourseCategoryName(c) || `Category ${categoryId.slice(-4)}`;
      if (!byId.has(categoryId)) byId.set(categoryId, { _id: categoryId, name: categoryName });
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!selectedCategoryId) return courses;
    return courses.filter((c) => getCourseCategoryId(c) === selectedCategoryId);
  }, [courses, selectedCategoryId]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      setToast({ show: false, type, message: "" });
    }, 2400);
  };

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onCategoryChange = (e) => {
    const nextCategoryId = e.target.value;
    setSelectedCategoryId(nextCategoryId);

    setForm((prev) => {
      if (!prev.courseId || !nextCategoryId) return prev;
      const selectedCourse = courses.find((c) => String(c._id) === String(prev.courseId));
      if (getCourseCategoryId(selectedCourse) !== nextCategoryId) {
        return { ...prev, courseId: "" };
      }
      return prev;
    });
  };

  const onCourseChange = (e) => {
    const nextCourseId = e.target.value;
    setForm((prev) => ({ ...prev, courseId: nextCourseId }));

    const selectedCourse = courses.find((c) => String(c._id) === String(nextCourseId));
    const categoryId = getCourseCategoryId(selectedCourse);
    if (categoryId) setSelectedCategoryId(categoryId);
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const load = async () => {
    // Courses
    let courseList = [];
    try {
      const cRes = await adminGetCourses();
      courseList = cRes?.data?.data || [];
      setCourses(courseList);
    } catch {
      setCourses([]);
      courseList = [];
    }

    // Student
    if (!isEdit) {
      setSelectedCategoryId("");
      return;
    }

    setLoading(true);
    try {
      const sRes = await adminGetStudent(id);
      const s = sRes?.data?.data;

      setForm({
        name: s?.name || "",
        courseId: s?.courseId?._id || s?.courseId || "",
        fatherName: s?.fatherName || "",
        fatherNumber: s?.fatherNumber || "",
        studentNumber: s?.studentNumber || "",
        address: s?.address || "",
        joiningDate: s?.joiningDate
          ? new Date(s.joiningDate).toISOString().slice(0, 10)
          : "",
        batchType: s?.batchType || "Mon/Wed/Fri",
        status: s?.status || "ACTIVE",
      });

      const selectedCourseId = s?.courseId?._id || s?.courseId || "";
      const selectedCourse = courseList.find((c) => String(c._id) === String(selectedCourseId));
      setSelectedCategoryId(getCourseCategoryId(selectedCourse));

      setPreview(resolveAssetUrl(s?.photoUrl || ""));
    } catch {
      showToast("Failed to load student details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const title = isEdit ? "Edit Student" : "Add Student";

  const canSave = useMemo(() => {
    return (
      !saving &&
      form.name.trim().length > 1 &&
      String(form.courseId || "").length > 5
    );
  }, [form.name, form.courseId, saving]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("photo", photoFile);

      if (isEdit) await adminUpdateStudent(id, fd);
      else await adminCreateStudent(fd);

      showToast("Student saved successfully", "success");
      navigate("/admin/students", { replace: true });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save student", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, type: toast.type, message: "" })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <UserRound className="h-6 w-6 text-white/75" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50">Students</div>
              <h1 className="text-2xl font-extrabold text-white">{title}</h1>
              <p className="mt-1 text-sm text-white/60">
                Fill the student details, select course, and upload photo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCcw className="h-5 w-5" />
              Reload
            </button>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      {loading ? (
        <StudentFormSkeleton />
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          {/* Left */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5">
                <GraduationCap className="h-5 w-5 text-white/70" />
              </div>
              <div className="text-sm font-extrabold text-white">
                Basic Information
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <Label>Student Name</Label>
                <div className="mt-2">
                  <Input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Enter student name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <div className="mt-2">
                  <Select
                    value={selectedCategoryId}
                    onChange={onCategoryChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {categories.length === 0 && (
                  <div className="mt-2 text-xs font-semibold text-rose-200">
                    No categories found from courses. Create categories and courses first.
                  </div>
                )}
              </div>

              <div>
                <Label>Course</Label>
                <div className="mt-2">
                  <Select
                    name="courseId"
                    value={form.courseId}
                    onChange={onCourseChange}
                    required
                  >
                    <option value="">
                      Select course
                    </option>
                    {filteredCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.duration})
                      </option>
                    ))}
                  </Select>
                </div>
                {selectedCategoryId && filteredCourses.length === 0 && (
                  <div className="mt-2 text-xs font-semibold text-rose-200">
                    No courses found for selected category.
                  </div>
                )}
                {courses.length === 0 && (
                  <div className="mt-2 text-xs font-semibold text-rose-200">
                    No courses found. Add courses first.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Father Name</Label>
                  <div className="mt-2">
                    <Input
                      name="fatherName"
                      value={form.fatherName}
                      onChange={onChange}
                      placeholder="Enter father name"
                    />
                  </div>
                </div>

                <div>
                  <Label>Father Number</Label>
                  <div className="mt-2">
                    <Input
                      name="fatherNumber"
                      value={form.fatherNumber}
                      onChange={onChange}
                      placeholder="Enter father phone"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Student Number</Label>
                <div className="mt-2">
                  <Input
                    name="studentNumber"
                    value={form.studentNumber}
                    onChange={onChange}
                    placeholder="Enter student phone"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <div className="mt-2">
                  <Textarea
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Enter address"
                    rows={4}
                  />
                </div>
              </div>

              {/* small help */}
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55">
                Tip: Uploading student photo helps for certificate and profile.
              </div>
            </div>
          </Card>

          {/* Right */}
          <Card>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5">
                <ImageIcon className="h-5 w-5 text-white/70" />
              </div>
              <div className="text-sm font-extrabold text-white">
                Photo & Batch
              </div>
            </div>

            <div className="mt-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-44 place-items-center text-sm font-semibold text-white/45">
                    No photo selected
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={onPickPhoto}
                className="mt-3 w-full text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/15"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/55">
                <Users className="h-4 w-4" />
                Batch Type
              </div>
              <div className="mt-2">
                <Select
                  name="batchType"
                  value={form.batchType}
                  onChange={onChange}
                >
                  <option className="text-black">Mon/Wed/Fri</option>
                  <option className="text-black">Tue/Thu/Sat</option>
                  <option className="text-black">Weekdays + Sunday</option>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/55">
                <CalendarDays className="h-4 w-4" />
                Joining Date
              </div>
              <div className="mt-2">
                <Input
                  type="date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={onChange}
                />
              </div>
            </div>

            {isEdit && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/55">
                  <Phone className="h-4 w-4" />
                  Status
                </div>
                <div className="mt-2">
                  <Select name="status" value={form.status} onChange={onChange}>
                    <option value="ACTIVE" className="text-black">
                      ACTIVE
                    </option>
                    <option value="INACTIVE" className="text-black">
                      INACTIVE
                    </option>
                  </Select>
                </div>
              </div>
            )}

            <button
              disabled={!canSave}
              className={clsx(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition active:scale-[0.98]",
                canSave
                  ? "bg-sky-500/85 hover:brightness-110 shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]"
                  : "bg-white/10 text-white/50 cursor-not-allowed"
              )}
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : isEdit ? "Update Student" : "Add Student"}
            </button>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55">
              <div className="flex items-start gap-2">
                <Home className="h-4 w-4 text-white/60" />
                <div>
                  Photo should be JPG/PNG/WEBP. Keep it clear for profile and
                  certificate.
                </div>
              </div>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}

function StudentFormSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 grid gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
          ))}
          <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 h-44 rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-4 h-12 rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-3 h-12 rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-3 h-12 rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-5 h-12 rounded-2xl bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

