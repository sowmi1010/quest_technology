import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
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
import { INSTALLMENT_START, formatINR, getPublicImageUrl } from "../../utils/publicUi";
import PublicSeo from "../../components/seo/PublicSeo";

/* ----------------------------- Motion helpers ----------------------------- */

const ease = [0.16, 1, 0.3, 1];

function useMotion() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
  };

  return { reduce, fadeUp, stagger };
}

/* ----------------------------- Neo UI Primitives ----------------------------- */

function PremiumShell({ children }) {
  return (
    <div className="relative overflow-x-hidden">
      {/* Neo mesh background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.11),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      {children}
    </div>
  );
}

function NeoCard({ className = "", children }) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl " +
        "dark:bg-slate-950/45 dark:border-white/10 " +
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-500 " +
        "before:bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.16),transparent_55%)] " +
        "group-hover:before:opacity-100 " +
        className
      }
    >
      {/* subtle ring */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      {/* shine sweep */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <NeoCard>
      <div className="h-44 animate-pulse bg-black/5 dark:bg-white/10" />
      <div className="p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-black/5 dark:bg-white/10" />
        <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-black/5 dark:bg-white/10" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-black/5 dark:bg-white/10" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-black/5 dark:bg-white/10" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-black/5 dark:bg-white/10" />
        </div>
        <div className="mt-5 h-10 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
      </div>
    </NeoCard>
  );
}

function EmptyState({ title, sub, action }) {
  return (
    <NeoCard className="p-7 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/60 text-cyan-700 dark:bg-white/5 dark:text-cyan-300">
        <IconSearch className="h-5 w-5" />
      </div>
      <div className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-600 dark:text-white/60">{sub}</div>
      {action}
    </NeoCard>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold transition",
        active
          ? "border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_12px_40px_rgba(34,211,238,0.18)]"
          : "border-white/14 bg-white/60 text-slate-900 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const controlBase =
  "rounded-2xl border border-white/12 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-900 outline-none " +
  "focus:ring-2 focus:ring-cyan-300/35 dark:border-white/10 dark:bg-white/5 dark:text-white " +
  "[&>option]:bg-white [&>option]:text-slate-900";

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

  const { fadeUp, stagger } = useMotion();

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

    if (sort === "feeLow") list.sort((a, b) => Number(a.totalFee || 0) - Number(b.totalFee || 0));
    if (sort === "feeHigh") list.sort((a, b) => Number(b.totalFee || 0) - Number(a.totalFee || 0));
    if (sort === "duration") list.sort((a, b) => String(a.duration || "").localeCompare(String(b.duration || "")));

    return list;
  }, [courses, query, sort]);

  const totalShown = filtered.length;

  return (
    <PremiumShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PublicSeo
          title="Courses - IT, Accounts, Mechanical and Tuition Programs"
          description="Browse all Quest Technology courses by category, duration, and fee. Compare programs and choose the right learning path for your career goals."
          keywords="Quest Technology courses, IT courses, accounts courses, mechanical design courses, tuition programs"
          canonicalPath="/courses"
        />

        {/* HERO / CONSOLE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <NeoCard className="p-6 md:p-8">
            {/* decorative orbs */}
            <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
              Course Catalog
            </p>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                  Find the right program for your goal
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-white/60">
                  Browse duration, fees, and installment options. Installments start from{" "}
                  <span className="font-extrabold text-cyan-700 dark:text-cyan-300">
                    {formatINR(INSTALLMENT_START)}
                  </span>
                  .
                </p>
              </div>

              {/* Count pill */}
              <div className="w-fit rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-xs font-bold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                Showing{" "}
                <span className="font-extrabold text-slate-950 dark:text-white">{totalShown}</span>{" "}
                course{totalShown === 1 ? "" : "s"}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              {/* Search */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(167,139,250,0.10),transparent_55%)] opacity-70" />
                <div className="relative flex items-center gap-2 rounded-2xl border border-white/12 bg-white/60 px-3 py-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <IconSearch className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search course / category / duration..."
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-500 outline-none dark:text-white dark:placeholder:text-white/40"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="rounded-xl border border-white/12 bg-white/60 px-3 py-1 text-xs font-extrabold text-slate-800 hover:bg-white/80 dark:border-white/10 dark:bg-white/10 dark:text-white"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Right controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/60 px-3 py-2 text-sm font-bold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                  <IconFilter className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                  Filter
                </div>

                <select value={categoryId} onChange={onFilter} className={controlBase}>
                  <option value="">All Categories</option>
                  {categories
                    .filter((c) => c._id !== "")
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>

                <select value={sort} onChange={(e) => setSort(e.target.value)} className={controlBase}>
                  <option value="featured">Sort: Featured</option>
                  <option value="feeLow">Fee: Low → High</option>
                  <option value="feeHigh">Fee: High → Low</option>
                  <option value="duration">Duration</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center gap-2">
                  <Chip active={view === "grid"} onClick={() => setView("grid")}>
                    Grid
                  </Chip>
                  <Chip active={view === "compact"} onClick={() => setView("compact")}>
                    Compact
                  </Chip>
                </div>
              </div>
            </div>

            {/* Hint line */}
            <div className="mt-4 text-xs text-slate-500 dark:text-white/55">
              Tip: Try searching “AWS”, “Tally”, “Full Stack”, or duration like “3 months”.
            </div>
          </NeoCard>
        </motion.div>

        {/* BODY */}
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
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setQuery("")}
                    className="rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-extrabold text-white hover:brightness-110"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={async () => {
                      setCategoryId("");
                      await loadCourses("");
                    }}
                    className="rounded-2xl border border-white/14 bg-white/60 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    Show All Categories
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className={`mt-6 grid gap-5 ${
              view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {filtered.map((course, index) => (
              <motion.div key={course._id} variants={fadeUp}>
                <CourseCard course={course} index={index} compact={view === "compact"} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PremiumShell>
  );
}

/* ----------------------------- Card ----------------------------- */

function CourseCard({ course, index, compact }) {
  const img = getPublicImageUrl(course.imageUrl);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease }}
      className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl transition hover:shadow-2xl
                 dark:border-white/10 dark:bg-slate-950/45"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* neon glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-14 -bottom-14 h-52 w-52 rounded-full bg-violet-400/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      {/* shine */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />

      <div className={compact ? "grid md:grid-cols-[260px_1fr]" : ""}>
        {/* Media */}
        <div className={compact ? "md:h-full" : ""}>
          {img ? (
            <div className="relative overflow-hidden">
              <img
                src={img}
                alt={course.title}
                className={`${compact ? "h-48 md:h-full" : "h-48"} w-full object-cover transition duration-700 group-hover:scale-[1.05]`}
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />

              {/* floating badge */}
              <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                {course.categoryId?.name || "Category"}
              </div>
            </div>
          ) : (
            <div
              className={`${
                compact ? "h-48 md:h-full" : "h-48"
              } flex items-center justify-center bg-black/5 text-slate-500 dark:bg-white/5 dark:text-white/60`}
            >
              <IconBookOpen className="h-7 w-7" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/12 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/65">
              Installment from {formatINR(course.installmentStart ?? INSTALLMENT_START)}
            </span>

            <span className="rounded-full bg-gradient-to-r from-cyan-500/15 to-violet-500/15 px-3 py-1 text-[11px] font-extrabold text-slate-900 dark:text-white/85">
              Premium Track
            </span>
          </div>

          <h2 className="mt-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {course.title}
          </h2>

          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-white/60">
            <p className="flex items-center gap-2">
              <IconClock className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
              <span>{course.duration || "Flexible duration"}</span>
            </p>

            <p className="flex items-center gap-2">
              <IconBriefcase className="h-4 w-4 text-violet-700 dark:text-violet-300" />
              <span className="font-semibold">
                Total Fee:{" "}
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatINR(course.totalFee)}
                </span>
              </span>
            </p>
          </div>

          <Link
            to={`/courses/${course._id}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl
                       bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-extrabold text-white
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            View Syllabus
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}