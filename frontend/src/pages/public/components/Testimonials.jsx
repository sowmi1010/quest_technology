import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { listPublicFeedback } from "../../../services/feedbackApi";
import { IconQuote, IconSearch, IconStar, IconFilter } from "../../../components/ui/PublicIcons";
import { getPublicImageUrl } from "../../../utils/publicUi";

const INITIAL_VISIBLE = 6;
const FEEDBACK_PREVIEW_LIMIT = 180;

const ratingFilters = [
  { key: 0, label: "All Ratings" },
  { key: 5, label: "5 Star" },
  { key: 4, label: "4+ Star" },
];

function clampRating(v) {
  const n = Number(v || 0);
  return Math.max(0, Math.min(5, n));
}

/* ----------------------------- Motion ----------------------------- */

const ease = [0.16, 1, 0.3, 1];

function useMotion() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
  };

  return { reduce, fadeUp, stagger };
}

/* ----------------------------- Neo UI helpers ----------------------------- */

function PremiumShell({ children }) {
  return (
    <div className="relative overflow-x-hidden">
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
      className={[
        "group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl",
        "dark:bg-slate-950/45 dark:border-white/10",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-500",
        "before:bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.16),transparent_55%)]",
        "group-hover:before:opacity-100",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] transition",
        active
          ? "border-transparent bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_18px_45px_-28px_rgba(34,211,238,0.65)]"
          : "border-white/14 bg-white/60 text-slate-800 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ----------------------------- Loading ----------------------------- */

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/70 p-6 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-black/5 dark:bg-white/10" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-black/5 dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-4 h-4 w-40 animate-pulse rounded bg-black/5 dark:bg-white/10" />
      <div className="mt-3 h-20 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
    </div>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function Testimonials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("LATEST"); // LATEST | RATING
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [expandedById, setExpandedById] = useState({});

  const { reduce, fadeUp, stagger } = useMotion();

  const load = async () => {
    setLoading(true);
    try {
      const res = await listPublicFeedback();
      setRows(res?.data?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const courses = useMemo(() => {
    const seen = new Set();
    const list = [];

    for (const row of rows) {
      const raw = String(row.course || "").trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(raw);
    }

    return list.sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const avg = useMemo(() => {
    if (!rows.length) return 0;
    const total = rows.reduce((sum, r) => sum + clampRating(r.rating), 0);
    return total / rows.length;
  }, [rows]);

  const placedCount = useMemo(
    () => rows.filter((r) => String(r.company || "").trim().length > 0).length,
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;

    if (minRating > 0) list = list.filter((row) => clampRating(row.rating) >= minRating);

    if (courseFilter !== "ALL") {
      const courseKey = String(courseFilter || "").trim().toLowerCase();
      list = list.filter((row) => String(row.course || "").trim().toLowerCase() === courseKey);
    }

    if (q) {
      list = list.filter((row) => {
        const line = [row.name, row.course, row.company, row.feedback]
          .map((item) => String(item || "").toLowerCase())
          .join(" ");
        return line.includes(q);
      });
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "RATING") {
        const d = clampRating(b.rating) - clampRating(a.rating);
        if (d !== 0) return d;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return list;
  }, [rows, query, minRating, courseFilter, sortBy]);

  const visibleRows = useMemo(() => filteredRows.slice(0, visibleCount), [filteredRows, visibleCount]);
  const hasMore = visibleCount < filteredRows.length;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [query, courseFilter, minRating, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setCourseFilter("ALL");
    setMinRating(0);
    setSortBy("LATEST");
    setVisibleCount(INITIAL_VISIBLE);
  };

  const toggleExpanded = (id) => setExpandedById((p) => ({ ...p, [id]: !p[id] }));

  if (!loading && !rows.length) return null;

  return (
    <PremiumShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 font-modern">
        {/* HERO / CONTROLS */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="mb-6"
        >

        </motion.div>

        {/* GRID */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading
            ? Array.from({ length: INITIAL_VISIBLE }).map((_, i) => <SkeletonCard key={i} />)
            : visibleRows.map((row, index) => {
                const rating = clampRating(row.rating);
                const id = String(row._id || `${row.name || "student"}-${index}`);
                const content = String(row.feedback || "").trim();
                const isLong = content.length > FEEDBACK_PREVIEW_LIMIT;
                const expanded = Boolean(expandedById[id]);
                const shown =
                  isLong && !expanded ? `${content.slice(0, FEEDBACK_PREVIEW_LIMIT).trimEnd()}...` : content;

                return (
                  <motion.article key={id} variants={fadeUp}>
                    <NeoCard className="p-6 transition hover:-translate-y-1">
                      {/* quote badge */}
                      <span className="absolute right-5 top-5 rounded-2xl border border-white/12 bg-white/60 p-2 text-cyan-700 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-cyan-300">
                        <IconQuote className="h-4 w-4" />
                      </span>

                      <div className="flex items-center gap-4">
                        {row.imageUrl ? (
                          <img
                            src={getPublicImageUrl(row.imageUrl)}
                            alt={row.name || "Student"}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20 dark:ring-white/10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/14 bg-white/60 text-sm font-extrabold tracking-wide text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                            {row.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                        )}

                        <div className="pr-10">
                          <h3 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {row.name || "Student"}
                          </h3>
                          <p className="text-xs font-semibold tracking-wide text-slate-600 dark:text-white/60">
                            {row.course || "Learner"}
                          </p>
                        </div>
                      </div>

                      {/* rating */}
                      <div className="mt-4 flex items-center gap-1">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <IconStar key={i} className="h-4 w-4" filled={i < Math.round(rating)} />
                          ))}
                        </div>
                        <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-white/55">
                          {rating.toFixed(1)}
                        </span>
                      </div>

                      {/* feedback */}
                      <p className="mt-3 rounded-2xl border border-white/12 bg-white/55 p-4 text-[15px] leading-7 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                        “{shown || "Feedback coming soon."}”
                      </p>

                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(id)}
                          className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-700 transition hover:brightness-90 dark:text-cyan-300"
                        >
                          {expanded ? "Read Less" : "Read More"}
                        </button>
                      )}

                      {row.company && (
                        <div className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500/15 to-violet-500/15 px-3 py-1 text-xs font-extrabold tracking-wide text-slate-900 dark:text-white/85">
                          Placed at{" "}
                          <span className="ml-1 text-cyan-700 dark:text-cyan-300">{row.company}</span>
                        </div>
                      )}
                    </NeoCard>
                  </motion.article>
                );
              })}
        </motion.div>

        {!loading && filteredRows.length === 0 && (
          <div className="mt-6">
            <NeoCard className="p-6 text-center">
              <div className="text-sm font-semibold text-slate-600 dark:text-white/60">
                No testimonials match these filters.
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
              >
                <IconFilter className="h-4 w-4" />
                Reset Filters
              </button>
            </NeoCard>
          </div>
        )}

        {!loading && hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + INITIAL_VISIBLE)}
              className="rounded-2xl border border-white/14 bg-white/60 px-6 py-3 text-sm font-extrabold tracking-wide text-slate-900 transition
                         hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Load More Testimonials
            </button>
          </div>
        )}
      </section>
    </PremiumShell>
  );
}