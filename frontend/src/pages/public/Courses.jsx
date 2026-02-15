import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { publicGetCourses } from "../../services/courseApi";
import { api } from "../../services/api";
import {
  IconArrowRight,
  IconBookOpen,
  IconBriefcase,
  IconClock,
  IconFilter,
  IconSearch,
} from "../../components/ui/PublicIcons";
import {
  INSTALLMENT_START,
  formatINR,
  getPublicImageUrl,
} from "../../utils/publicUi";
import PublicSeo from "../../components/seo/PublicSeo";

/* ----------------------------- UI Helpers ----------------------------- */

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10 overflow-hidden">
      <div className="h-44 bg-peacock-bg animate-pulse dark:bg-white/10" />
      <div className="p-5">
        <div className="h-3 w-24 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="mt-2 h-5 w-3/4 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-2/3 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
          <div className="h-4 w-3/5 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        </div>
        <div className="mt-5 h-10 rounded-2xl bg-peacock-bg animate-pulse dark:bg-white/10" />
      </div>
    </div>
  );
}

function EmptyState({ title, sub, action }) {
  return (
    <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
      <div className="text-lg font-extrabold text-peacock-navy dark:text-white">{title}</div>
      <div className="mt-1 text-sm text-peacock-muted dark:text-white/60">{sub}</div>
      {action}
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold transition
        ${
          active
            ? "border-peacock-blue bg-peacock-blue text-white"
            : "border-peacock-border/70 bg-white/60 text-peacock-navy hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------- Main Page ----------------------------- */

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  // Premium features
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured"); // featured | feeLow | feeHigh | duration
  const [view, setView] = useState("grid"); // grid | compact

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...courses];

    if (q) {
      list = list.filter((c) => {
        const title = String(c.title || "").toLowerCase();
        const cat = String(c.categoryId?.name || "").toLowerCase();
        const dur = String(c.duration || "").toLowerCase();
        return title.includes(q) || cat.includes(q) || dur.includes(q);
      });
    }

    // Sorting
    if (sort === "feeLow") list.sort((a, b) => (Number(a.totalFee || 0) - Number(b.totalFee || 0)));
    if (sort === "feeHigh") list.sort((a, b) => (Number(b.totalFee || 0) - Number(a.totalFee || 0)));
    if (sort === "duration") list.sort((a, b) => String(a.duration || "").localeCompare(String(b.duration || "")));

    return list;
  }, [courses, query, sort]);

  const totalShown = filtered.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PublicSeo
        title="Courses - IT, Accounts, Mechanical and Tuition Programs"
        description="Browse all Quest Technology courses by category, duration, and fee. Compare programs and choose the right learning path for your career goals."
        keywords="Quest Technology courses, IT courses, accounts courses, mechanical design courses, tuition programs"
        canonicalPath="/courses"
      />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl md:p-8 dark:bg-slate-950/35 dark:border-white/10">
        {/* glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />

        <div>
          <p className="inline-flex items-center rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
            Course Catalog
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-peacock-navy md:text-4xl dark:text-white">
            Find the right program for your goal
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/60">
            Browse duration, fees, syllabus outline, and installment options. Installments start from{" "}
            <span className="font-extrabold text-peacock-blue dark:text-sky-200">
              {formatINR(INSTALLMENT_START)}
            </span>
            .
          </p>
        </div>

        {/* Controls */}
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <IconSearch className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search course / category / duration..."
              className="w-full bg-transparent text-sm font-semibold text-peacock-navy placeholder:text-peacock-muted outline-none dark:text-white dark:placeholder:text-white/40"
            />
          </div>

          {/* Right controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-3 py-2 text-sm font-bold text-peacock-navy dark:border-white/10 dark:bg-white/5 dark:text-white/80">
              <IconFilter className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
              Filter
            </div>

            <select
              value={categoryId}
              onChange={onFilter}
              className="rounded-2xl border border-peacock-border/60 bg-white/60  px-3 py-2 text-sm font-semibold text-peacock-navy outline-none
                         focus:ring-2 focus:ring-peacock-blue/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
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

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border border-peacock-border/60 bg-white/60 px-3 py-2 text-sm font-semibold text-peacock-navy outline-none
                         focus:ring-2 focus:ring-peacock-blue/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="featured">Sort: Featured</option>
              <option value="feeLow">Fee: Low → High</option>
              <option value="feeHigh">Fee: High → Low</option>
              <option value="duration">Duration</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center gap-2">
              <Chip active={view === "grid"} onClick={() => setView("grid")}>Grid</Chip>
              <Chip active={view === "compact"} onClick={() => setView("compact")}>Compact</Chip>
            </div>
          </div>
        </div>

        {/* Count line */}
        <div className="mt-4 text-xs text-peacock-muted dark:text-white/60">
          Showing <span className="font-extrabold text-peacock-navy dark:text-white">{totalShown}</span>{" "}
          course{totalShown === 1 ? "" : "s"}
          {categoryId ? " in selected category" : ""}.
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No courses found"
            sub="Try a different category or clear your search."
            action={
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setQuery("")}
                  className="rounded-2xl bg-peacock-blue px-4 py-2 text-sm font-extrabold text-white hover:brightness-110"
                >
                  Clear Search
                </button>
                <button
                  onClick={async () => {
                    setCategoryId("");
                    await loadCourses("");
                  }}
                  className="rounded-2xl border border-peacock-border/60 bg-white/60 px-4 py-2 text-sm font-extrabold text-peacock-navy hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Show All Categories
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <div
          className={`mt-6 grid gap-5 ${
            view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {filtered.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} compact={view === "compact"} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Card ----------------------------- */

function CourseCard({ course, index, compact }) {
  const img = getPublicImageUrl(course.imageUrl);

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl transition
                  hover:-translate-y-1 hover:shadow-xl dark:bg-slate-950/35 dark:border-white/10`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-peacock-blue/10 blur-3xl opacity-0 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-peacock-green/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

      <div className={compact ? "grid md:grid-cols-[220px_1fr]" : ""}>
        {/* Media */}
        <div className={compact ? "md:h-full" : ""}>
          {img ? (
            <img
              src={img}
              alt={course.title}
              className={`${compact ? "h-44 md:h-full" : "h-44"} w-full object-cover`}
              loading="lazy"
            />
          ) : (
            <div className={`${compact ? "h-44 md:h-full" : "h-44"} flex items-center justify-center bg-peacock-bg text-peacock-muted dark:bg-white/5 dark:text-white/60`}>
              <IconBookOpen className="h-7 w-7" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              {course.categoryId?.name || "Category"}
            </span>

            <span className="rounded-full bg-gradient-to-r from-peacock-blue/15 to-peacock-green/15 px-3 py-1 text-[11px] font-extrabold text-peacock-navy dark:text-white/80">
              Installment from {formatINR(course.installmentStart ?? INSTALLMENT_START)}
            </span>
          </div>

          <h2 className="mt-2 text-lg font-extrabold text-peacock-navy dark:text-white">
            {course.title}
          </h2>

          <div className="mt-3 space-y-2 text-sm text-peacock-muted dark:text-white/60">
            <p className="flex items-center gap-2">
              <IconClock className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
              <span>{course.duration || "Flexible duration"}</span>
            </p>

            <p className="flex items-center gap-2">
              <IconBriefcase className="h-4 w-4 text-peacock-green dark:text-emerald-200" />
              <span className="font-semibold">
                Total Fee: <span className="font-extrabold text-peacock-navy dark:text-white">{formatINR(course.totalFee)}</span>
              </span>
            </p>
          </div>

          <Link
            to={`/courses/${course._id}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-4 py-3 text-sm font-extrabold text-white
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            View Details
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
