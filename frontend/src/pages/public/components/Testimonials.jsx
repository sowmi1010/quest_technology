import { useEffect, useMemo, useState } from "react";
import { listPublicFeedback } from "../../../services/feedbackApi";
import { IconQuote, IconStar } from "../../../components/ui/PublicIcons";
import { getPublicImageUrl } from "../../../utils/publicUi";

function clampRating(v) {
  const n = Number(v || 0);
  return Math.max(0, Math.min(5, n));
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-peacock-border/50 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
          <div className="mt-2 h-3 w-24 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-4 h-4 w-40 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
      <div className="mt-3 h-20 rounded-2xl bg-peacock-bg animate-pulse dark:bg-white/10" />
    </div>
  );
}

export default function Testimonials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listPublicFeedback();
      setRows(res.data.data || []);
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
    // 5-star distribution
    const dist = [0, 0, 0, 0, 0]; // index 0 => 1-star, 4 => 5-star
    for (const r of rows) {
      const star = Math.round(clampRating(r.rating));
      if (star >= 1 && star <= 5) dist[star - 1]++;
    }
    return dist;
  }, [rows]);

  if (!loading && !rows.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
        {/* Ink Blue & Green glow */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              Success Stories
            </p>

            <h2 className="mt-3 text-2xl font-extrabold text-peacock-navy md:text-3xl dark:text-white">
              Student Testimonials
            </h2>
            <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">
              Feedback from learners and placement achievers.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:max-w-md sm:grid-cols-2">
            <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-peacock-muted dark:text-white/55">
                Average Rating
              </p>
              <p className="mt-1 text-2xl font-extrabold text-peacock-navy dark:text-white">
                {loading ? "—" : avg.toFixed(1)}
                <span className="text-base font-bold text-peacock-muted dark:text-white/55">
                  {" "}
                  / 5.0
                </span>
              </p>

              <div className="mt-2 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    className="h-4 w-4"
                    filled={i < Math.round(avg)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-peacock-muted dark:text-white/55">
                Total Reviews
              </p>
              <p className="mt-1 text-2xl font-extrabold text-peacock-navy dark:text-white">
                {loading ? "—" : rows.length}
              </p>

              {!loading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-peacock-muted dark:text-white/60">
                  <span className="rounded-full bg-peacock-blue/10 px-2 py-1 font-semibold text-peacock-blue dark:bg-peacock-blue/20 dark:text-sky-200">
                    Ink Blue
                  </span>
                  <span className="rounded-full bg-peacock-green/10 px-2 py-1 font-semibold text-peacock-green dark:bg-peacock-green/20 dark:text-emerald-200">
                    Green
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tiny rating bars (optional but premium) */}
        {!loading && (
          <div className="mt-5 grid gap-2">
            {([5, 4, 3, 2, 1] || []).map((s, idx) => {
              const count = breakdown[s - 1] || 0;
              const pct = rows.length ? Math.round((count / rows.length) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-3 text-xs">
                  <div className="w-10 font-semibold text-peacock-navy dark:text-white/80">
                    {s}★
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-peacock-bg dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-peacock-blue to-peacock-green"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-peacock-muted dark:text-white/60">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : rows.map((row, index) => {
              const rating = clampRating(row.rating);

              return (
                <article
                  key={row._id}
                  className="group relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl transition
                             hover:-translate-y-1 hover:shadow-xl dark:bg-slate-950/35 dark:border-white/10"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-peacock-blue/10 blur-3xl opacity-0 transition group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-peacock-green/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

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
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-peacock-bg font-extrabold text-peacock-navy ring-2 ring-peacock-border dark:bg-white/5 dark:text-white dark:ring-white/10">
                        {row.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                    )}

                    <div className="pr-8">
                      <h3 className="font-extrabold text-peacock-navy dark:text-white">
                        {row.name || "Student"}
                      </h3>
                      <p className="text-xs text-peacock-muted dark:text-white/60">
                        {row.course || "Learner"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} className="h-4 w-4" filled={i < rating} />
                    ))}
                    <span className="ml-2 text-xs font-semibold text-peacock-muted dark:text-white/55">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="mt-3 rounded-2xl border border-peacock-border/50 bg-peacock-bg/50 p-4 text-sm leading-relaxed text-peacock-ink dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                    “{row.feedback}”
                  </p>

                  {row.company && (
                    <div className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-peacock-blue/15 to-peacock-green/15 px-3 py-1 text-xs font-extrabold text-peacock-navy dark:text-white/85">
                      Placed at <span className="ml-1 text-peacock-blue dark:text-sky-200">{row.company}</span>
                    </div>
                  )}
                </article>
              );
            })}
      </div>
    </section>
  );
}
