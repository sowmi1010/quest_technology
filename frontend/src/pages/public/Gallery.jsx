import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconCalendar,
  IconGraduationCap,
  IconSpark,
  IconX,
  IconArrowRight,
  IconArrowLeft,
} from "../../components/ui/PublicIcons";
import { publicListGallery } from "../../services/galleryApi";
import { getPublicImageUrl } from "../../utils/publicUi";
import { GALLERY_CATEGORY_OPTIONS, getGalleryCategoryLabel } from "../../utils/galleryCategories";
import PublicSeo from "../../components/seo/PublicSeo";

const ALL_CATEGORY = "ALL";

const categoryMeta = {
  WORKSHOPS_SEMINARS: {
    icon: IconSpark,
    tone: "text-cyan-700 dark:text-cyan-300",
    chip: "from-cyan-500/25 to-violet-500/20",
  },
  HANDS_ON_COLLEGE_TRAINING: {
    icon: IconGraduationCap,
    tone: "text-violet-700 dark:text-violet-300",
    chip: "from-violet-500/25 to-cyan-500/20",
  },
  EVENTS: {
    icon: IconCalendar,
    tone: "text-cyan-700 dark:text-cyan-300",
    chip: "from-cyan-500/25 to-violet-500/20",
  },
};

function categoryCountMap(rows) {
  return rows.reduce((acc, row) => {
    acc[row.category] = (acc[row.category] || 0) + 1;
    return acc;
  }, {});
}

const ease = [0.16, 1, 0.3, 1];

function useMotionPresets() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 12, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  return { reduce, container, fadeUp };
}

function clampIndex(i, len) {
  if (!len) return 0;
  return ((i % len) + len) % len;
}

/* ----------------------------- Neo Card ----------------------------- */

function NeoCard({ className = "", children, ...props }) {
  return (
    <motion.div
      {...props}
      className={
        "group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl " +
        "dark:bg-slate-950/45 dark:border-white/10 " +
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-500 " +
        "before:bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(167,139,250,0.16),transparent_55%)] " +
        "group-hover:before:opacity-100 " +
        className
      }
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ----------------------------- Masonry Card ----------------------------- */

function NeoMasonryCard({ row, meta, index, onOpen, reduce }) {
  const Icon = meta?.icon || IconSpark;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="group relative mb-4 break-inside-avoid min-w-0 overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl
                 transition will-change-transform hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950/45"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* neon aura */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_60%)] blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.18),transparent_60%)] blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative overflow-hidden">
          <motion.img
            src={getPublicImageUrl(row.imageUrl)}
            alt={row.title || getGalleryCategoryLabel(row.category)}
            className="w-full object-cover"
            loading="lazy"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.55, ease }}
          />

          {/* soft vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-95" />

          {/* category chip */}
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-gradient-to-r ${meta?.chip || "from-cyan-500/25 to-violet-500/20"} px-3 py-1 text-[11px] font-extrabold text-white`}
          >
            <Icon className="h-3.5 w-3.5" />
            {getGalleryCategoryLabel(row.category)}
          </span>

          {/* view chip */}
          <span className="absolute right-3 top-3 rounded-2xl border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/90">
            View
          </span>

          {/* shine */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />
        </div>

        <div className="p-4">
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            {row.title?.trim() || "Quest Gallery Update"}
          </h2>

          {row.description ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-white/65">
              {row.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600 dark:text-white/55">Tap to view full photo</p>
          )}
        </div>
      </button>
    </motion.article>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function Gallery() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(ALL_CATEGORY);

  // modal state
  const [selectedIndex, setSelectedIndex] = useState(null);

  const { reduce, container, fadeUp } = useMotionPresets();
  const closeBtnRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await publicListGallery();
        setRows(res?.data?.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(() => categoryCountMap(rows), [rows]);

  const filtered = useMemo(() => {
    if (category === ALL_CATEGORY) return rows;
    return rows.filter((row) => row.category === category);
  }, [category, rows]);

  const selected = useMemo(() => {
    if (selectedIndex == null) return null;
    if (!filtered.length) return null;
    return filtered[clampIndex(selectedIndex, filtered.length)];
  }, [selectedIndex, filtered]);

  // keyboard controls (ESC / arrows)
  useEffect(() => {
    if (!selected) return;

    const onKey = (e) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") setSelectedIndex((i) => clampIndex((i ?? 0) + 1, filtered.length));
      if (e.key === "ArrowLeft") setSelectedIndex((i) => clampIndex((i ?? 0) - 1, filtered.length));
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, filtered.length]);

  // lock scroll when modal open
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  // focus close button when modal opens
  useEffect(() => {
    if (selected) setTimeout(() => closeBtnRef.current?.focus(), 0);
  }, [selected]);

  const selectCategory = (val) => {
    setCategory(val);
    setSelectedIndex(null);
  };

  const onOpen = (rowId) => {
    const idx = filtered.findIndex((r) => r._id === rowId);
    setSelectedIndex(idx >= 0 ? idx : 0);
  };

  const goNext = () => setSelectedIndex((i) => clampIndex((i ?? 0) + 1, filtered.length));
  const goPrev = () => setSelectedIndex((i) => clampIndex((i ?? 0) - 1, filtered.length));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 overflow-x-hidden">
      <PublicSeo
        title="Gallery - Workshops, Seminars and Events"
        description="View Quest Technology gallery featuring workshops, seminars, college hands-on training sessions, and events."
        keywords="Quest Technology gallery, workshops photos, seminars photos, college training events"
        canonicalPath="/gallery"
      />

      {/* Neo Luxury background mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.11),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      {/* HERO */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <NeoCard className="p-6 md:p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/14 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-violet-400/12 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-25" />

          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            <IconSpark className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
            Gallery
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            Workshops, College Training, and Events
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-white/60">
            Explore moments from our workshops, seminars, hands-on sessions in colleges, and campus events.
            Tap any photo to view in full screen.
          </p>

          {/* Filters */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-wrap gap-2"
          >
            <FilterChip
              active={category === ALL_CATEGORY}
              onClick={() => selectCategory(ALL_CATEGORY)}
            >
              All ({rows.length})
            </FilterChip>

            {GALLERY_CATEGORY_OPTIONS.map((item) => {
              const meta = categoryMeta[item.value];
              const Icon = meta?.icon || IconSpark;
              const active = category === item.value;

              return (
                <FilterChip key={item.value} active={active} onClick={() => selectCategory(item.value)}>
                  <Icon className={`h-4 w-4 ${active ? "text-white" : meta?.tone}`} />
                  {item.label} ({counts[item.value] || 0})
                </FilterChip>
              );
            })}
          </motion.div>
        </NeoCard>
      </motion.div>

      {/* BODY */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <ShimmerTile key={idx} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-6">
          <NeoCard className="p-8 text-center text-sm text-slate-600 dark:text-white/60">
            No gallery photos in this category yet.
          </NeoCard>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((row, index) => {
            const meta = categoryMeta[row.category] || categoryMeta.WORKSHOPS_SEMINARS;
            return (
              <NeoMasonryCard
                key={row._id}
                row={row}
                meta={meta}
                index={index}
                reduce={reduce}
                onOpen={() => onOpen(row._id)}
              />
            );
          })}
        </motion.div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950/55 shadow-2xl"
              initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* neon top haze */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-400/14 blur-3xl" />

              {/* Top bar */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/25 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-white">
                    {selected.title?.trim() || getGalleryCategoryLabel(selected.category)}
                  </p>
                  <p className="truncate text-xs text-white/70">
                    {getGalleryCategoryLabel(selected.category)} • Use ← → keys
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-black/35 p-2 text-white transition hover:bg-black/60"
                    aria-label="Previous"
                  >
                    <IconArrowLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-black/35 p-2 text-white transition hover:bg-black/60"
                    aria-label="Next"
                  >
                    <IconArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={() => setSelectedIndex(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-black/40 p-2 text-white transition hover:bg-black/60"
                    aria-label="Close"
                  >
                    <IconX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Image */}
              <img
                src={getPublicImageUrl(selected.imageUrl)}
                alt={selected.title || getGalleryCategoryLabel(selected.category)}
                className="max-h-[78vh] w-full object-contain bg-black/40 pt-14"
              />

              {/* Footer */}
              <div className="border-t border-white/10 bg-black/30 p-4 text-white">
                {selected.description ? (
                  <p className="text-sm text-white/80">{selected.description}</p>
                ) : (
                  <p className="text-sm text-white/70">No description added yet.</p>
                )}
              </div>

              {/* Side arrows for desktop */}
              <button
                type="button"
                onClick={goPrev}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-black/35 p-2 text-white transition hover:bg-black/60"
                aria-label="Previous"
              >
                <IconArrowLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-black/35 p-2 text-white transition hover:bg-black/60"
                aria-label="Next"
              >
                <IconArrowRight className="h-6 w-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ----------------------------- Small Components ----------------------------- */

function FilterChip({ active, onClick, children }) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 10, filter: "blur(8px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
      }}
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition",
        active
          ? "border-cyan-400/40 bg-gradient-to-r from-cyan-500/90 to-violet-500/85 text-white shadow-lift"
          : "border-white/15 bg-white/60 text-slate-900 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}

function ShimmerTile() {
  return (
    <div className="relative h-80 overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.40),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
    </div>
  );
}