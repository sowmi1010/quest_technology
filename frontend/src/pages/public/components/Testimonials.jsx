import { useEffect, useMemo, useState } from "react";
import { listPublicFeedback } from "../../../services/feedbackApi";
import {
  IconFilter,
  IconQuote,
  IconSearch,
  IconStar,
} from "../../../components/ui/PublicIcons";
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

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-peacock-border/50 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-peacock-bg dark:bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-peacock-bg dark:bg-white/10" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-peacock-bg dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-4 h-4 w-40 animate-pulse rounded bg-peacock-bg dark:bg-white/10" />
      <div className="mt-3 h-20 animate-pulse rounded-2xl bg-peacock-bg dark:bg-white/10" />
    </div>
  );
}

export default function Testimonials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("LATEST");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [expandedById, setExpandedById] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await listPublicFeedback();
      setRows(res.data.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const avg = useMemo(() => {
    if (!rows.length) return 0;
    const total = rows.reduce((sum, r) => sum + clampRating(r.rating), 0);
    return total / rows.length;
  }, [rows]);

  const breakdown = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    for (const r of rows) {
      const star = Math.round(clampRating(r.rating));
      if (star >= 1 && star <= 5) dist[star - 1]++;
    }
    return dist;
  }, [rows]);

  const placedCount = useMemo(
    () => rows.filter((r) => String(r.company || "").trim().length > 0).length,
    [rows],
  );

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

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;

    if (minRating > 0) {
      list = list.filter((row) => clampRating(row.rating) >= minRating);
    }

    if (courseFilter !== "ALL") {
      list = list.filter(
        (row) =>
          String(row.course || "")
            .trim()
            .toLowerCase() === courseFilter,
      );
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
        const ratingDiff = clampRating(b.rating) - clampRating(a.rating);
        if (ratingDiff !== 0) return ratingDiff;
      }

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return list;
  }, [rows, query, minRating, courseFilter, sortBy]);

  const visibleRows = useMemo(
    () => filteredRows.slice(0, visibleCount),
    [filteredRows, visibleCount],
  );
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

  const toggleExpanded = (id) => {
    setExpandedById((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!loading && !rows.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 font-modern">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />

      {/* GRID */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: INITIAL_VISIBLE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : visibleRows.map((row, index) => {
              const rating = clampRating(row.rating);
              const id = String(row._id || `${row.name || "student"}-${index}`);
              const content = String(row.feedback || "").trim();
              const isLong = content.length > FEEDBACK_PREVIEW_LIMIT;
              const expanded = Boolean(expandedById[id]);
              const shown =
                isLong && !expanded
                  ? `${content.slice(0, FEEDBACK_PREVIEW_LIMIT).trimEnd()}...`
                  : content;

              return (
                <article
                  key={id}
                  className="group relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/35"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-peacock-blue/10 opacity-0 blur-3xl transition group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-peacock-green/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

                  <span className="absolute right-5 top-5 rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 p-2 text-peacock-blue shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-sky-200">
                    <IconQuote className="h-4 w-4" />
                  </span>

                  <div className="flex items-center gap-4">
                    {row.imageUrl ? (
                      <img
                        src={getPublicImageUrl(row.imageUrl)}
                        alt={row.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-peacock-border dark:ring-white/10"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-peacock-bg text-sm font-extrabold tracking-wide text-peacock-navy ring-2 ring-peacock-border dark:bg-white/5 dark:text-white dark:ring-white/10">
                        {row.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                    )}

                    <div className="pr-8">
                      <h3 className="text-[15px] font-extrabold tracking-tight text-peacock-navy dark:text-white">
                        {row.name || "Student"}
                      </h3>
                      <p className="text-xs font-semibold tracking-wide text-peacock-muted dark:text-white/60">
                        {row.course || "Learner"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar
                        key={i}
                        className="h-4 w-4"
                        filled={i < rating}
                      />
                    ))}
                    <span className="ml-2 text-xs font-semibold text-peacock-muted dark:text-white/55">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="mt-3 rounded-2xl border border-peacock-border/50 bg-peacock-bg/50 p-4 text-[15px] leading-7 text-peacock-ink dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                    "{shown || "Feedback coming soon."}"
                  </p>

                  {isLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(id)}
                      className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-peacock-blue transition hover:brightness-90 dark:text-sky-200"
                    >
                      {expanded ? "Read Less" : "Read More"}
                    </button>
                  )}

                  {row.company && (
                    <div className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-peacock-blue/15 to-peacock-green/15 px-3 py-1 text-xs font-extrabold tracking-wide text-peacock-navy dark:text-white/85">
                      Placed at{" "}
                      <span className="ml-1 text-peacock-blue dark:text-sky-200">
                        {row.company}
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
      </div>

      {!loading && filteredRows.length === 0 && (
        <div className="mt-6 rounded-3xl border border-peacock-border/60 bg-white/70 p-6 text-center text-sm font-semibold text-peacock-muted shadow-soft dark:border-white/10 dark:bg-slate-950/35 dark:text-white/60">
          No testimonials match these filters.
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}
            className="rounded-2xl border border-peacock-border/70 bg-white/70 px-6 py-3 text-sm font-extrabold tracking-wide text-peacock-navy transition hover:-translate-y-0.5 hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Load More Testimonials
          </button>
        </div>
      )}
    </section>
  );
}
