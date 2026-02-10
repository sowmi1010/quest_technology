import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicGetCourses } from "../../services/courseApi";
import { api } from "../../services/api";
import {
  IconArrowRight,
  IconBookOpen,
  IconBriefcase,
  IconClock,
  IconFilter,
} from "../../components/ui/PublicIcons";
import {
  INSTALLMENT_START,
  formatINR,
  getPublicImageUrl,
} from "../../utils/publicUi";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/public");
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    }
  };

  const loadCourses = async (catId) => {
    setLoading(true);
    try {
      const res = await publicGetCourses(catId);
      setCourses(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadCourses("");
  }, []);

  const onFilter = async (e) => {
    const val = e.target.value;
    setCategoryId(val);
    await loadCourses(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="surface-card animate-fade-up p-6 md:p-8">
        <div>
          <p className="badge-soft">Course Catalog</p>
          <h1 className="mt-3 text-3xl font-bold text-peacock-navy md:text-4xl">Find the right program for your goal</h1>
          <p className="mt-2 text-sm leading-relaxed text-peacock-muted md:text-base">
            Browse course duration, fees, syllabus outline, and installment options. Installments start
            from {formatINR(INSTALLMENT_START)}.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-xl border border-peacock-border bg-peacock-bg px-3 py-2 text-sm font-medium text-peacock-navy">
            <IconFilter className="h-4 w-4 text-peacock-blue" />
            Filter by category
          </div>

          <select
            value={categoryId}
            onChange={onFilter}
            className="select-control max-w-sm"
          >
            <option value="">All Categories</option>
            {categories
              .filter((c) => c._id !== "")
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="surface-card mt-6 p-6 text-sm text-peacock-muted">Loading courses...</div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} />
          ))}

          {courses.length === 0 && (
            <div className="surface-card p-6 text-sm text-peacock-muted">
              No courses found for this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, index }) {
  const img = getPublicImageUrl(course.imageUrl);

  return (
    <article
      className="surface-card hover-tilt animate-fade-up group overflow-hidden"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {img ? (
        <img src={img} alt={course.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-peacock-bg text-peacock-muted">
          <IconBookOpen className="h-7 w-7" />
        </div>
      )}

      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-peacock-muted">
          {course.categoryId?.name || "Category"}
        </p>

        <h2 className="text-lg font-bold text-peacock-navy mt-1">
          {course.title}
        </h2>

        <div className="mt-3 space-y-2 text-sm text-peacock-muted">
          <p className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-peacock-blue" />
            <span>{course.duration || "Flexible duration"}</span>
          </p>

          <p className="flex items-center gap-2">
            <IconBriefcase className="h-4 w-4 text-peacock-green" />
            <span>Total Fee: {formatINR(course.totalFee)}</span>
          </p>

          <p>
            Installment from{" "}
            <span className="font-semibold text-peacock-blue">
              {formatINR(course.installmentStart ?? INSTALLMENT_START)}
            </span>
          </p>
        </div>

        <Link
          to={`/courses/${course._id}`}
          className="btn-primary mt-4 w-full !justify-center"
        >
          View Details
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
