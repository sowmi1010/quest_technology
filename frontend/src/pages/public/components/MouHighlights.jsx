import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { publicListMou } from "../../../services/mouApi";
import { getPublicImageUrl } from "../../../utils/publicUi";

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
      {/* Neo mesh background (local) */}
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

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
      {children}
    </span>
  );
}

/* ----------------------------- Loading UI ----------------------------- */

function LogoSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="h-20 w-full animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-black/5 dark:bg-white/10" />
    </div>
  );
}

/* ----------------------------- Item ----------------------------- */

function MouCard({ row, index, reduce }) {
  const img = getPublicImageUrl(row.imageUrl);

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
      }}
      className={[
        "group/item relative overflow-hidden rounded-2xl border border-white/12 bg-white/60 p-3",
        "shadow-soft backdrop-blur-2xl transition",
        "hover:-translate-y-1 hover:bg-white/75 hover:shadow-xl",
        "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
      ].join(" ")}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {/* micro glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/15 blur-2xl opacity-0 transition duration-500 group-hover/item:opacity-100" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-violet-400/15 blur-2xl opacity-0 transition duration-500 group-hover/item:opacity-100" />

      <div className="grid place-items-center rounded-xl border border-white/12 bg-white/55 p-3 dark:border-white/10 dark:bg-slate-950/25">
        <img
          src={img}
          alt={row?.name ? `${row.name} MoU Partner` : "MoU Partner"}
          className="h-20 w-full object-contain"
          loading="lazy"
        />
      </div>

      {/* label (optional) */}
      {row?.name ? (
        <p className="mt-3 line-clamp-2 text-center text-xs font-extrabold tracking-wide text-slate-700 dark:text-white/70">
          {row.name}
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] font-semibold text-slate-600/70 dark:text-white/50">
          MoU Partner
        </p>
      )}
    </motion.article>
  );
}

/* ----------------------------- Main ----------------------------- */

export default function MouHighlights() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { reduce, fadeUp, stagger } = useMotion();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await publicListMou();
        setRows(res?.data?.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasData = rows.length > 0;
  if (!loading && !hasData) return null;

  const total = useMemo(() => rows.length, [rows]);

  return (
    <PremiumShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <NeoCard className="p-6 sm:p-8">
          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Pill>
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                  MoU Highlights
                </Pill>

                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  Partnering for a Better Future
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-white/60">
                  Our collaborations with colleges and institutions to create real impact through training, workshops, and
                  industry-ready programs.
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-600 dark:text-white/60">
                {loading ? "Loading..." : `${total} partner${total === 1 ? "" : "s"}`}
              </div>
            </div>

            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/10" />
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
          >
            {loading
              ? Array.from({ length: 12 }).map((_, idx) => <LogoSkeleton key={idx} />)
              : rows.map((row, index) => (
                  <MouCard key={row._id} row={row} index={index} reduce={reduce} />
                ))}
          </motion.div>

          {/* Footer hint */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-600 dark:text-white/60">
            More MoUs are added regularly as we expand our academic partnerships.
          </div>
        </NeoCard>
      </section>
    </PremiumShell>
  );
}