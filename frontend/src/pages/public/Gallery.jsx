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
    tone: "text-peacock-blue dark:text-sky-200",
    chip: "from-peacock-blue/18 to-peacock-green/18",
  },
  HANDS_ON_COLLEGE_TRAINING: {
    icon: IconGraduationCap,
    tone: "text-peacock-green dark:text-emerald-200",
    chip: "from-peacock-green/18 to-peacock-blue/18",
  },
  EVENTS: {
    icon: IconCalendar,
    tone: "text-peacock-blue dark:text-sky-200",
    chip: "from-peacock-blue/18 to-peacock-green/18",
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
    show: {
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.05,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 12, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
  };

  return { reduce, container, card, fadeUp };
}

function clampIndex(i, len) {
  if (!len) return 0;
  return ((i % len) + len) % len;
}

/* ----------------------------- Premium Card ----------------------------- */

function PremiumMasonryCard({ row, meta, index, onOpen, reduce }) {
  const Icon = meta?.icon || IconSpark;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="group relative mb-4 break-inside-avoid min-w-0 overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl
                 transition will-change-transform hover:-translate-y-1 hover:border-peacock-blue/40 hover:shadow-xl
                 dark:border-white/10 dark:bg-slate-950/35"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* premium glow */}
      <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-peacock-blue/12 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-peacock-green/12 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
      {/* shine sweep */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />

      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative overflow-hidden">
          <motion.img
            src={getPublicImageUrl(row.imageUrl)}
            alt={row.title || getGalleryCategoryLabel(row.category)}
            className="w-full object-cover"
            loading="lazy"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.5, ease }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-95" />

          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-gradient-to-r ${meta.chip} px-3 py-1 text-[11px] font-extrabold text-white`}
          >
            <Icon className="h-3.5 w-3.5" />
            {getGalleryCategoryLabel(row.category)}
          </span>

          {/* corner badge */}
          <span className="absolute right-3 top-3 rounded-2xl border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/90">
            View
          </span>
        </div>

        <div className="p-4">
          <h2 className="text-base font-extrabold tracking-tight text-peacock-navy dark:text-white">
            {row.title?.trim() || "Quest Gallery Update"}
          </h2>

          {row.description ? (
            <p className="mt-1 text-sm leading-relaxed text-peacock-muted dark:text-white/65">
              {row.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-peacock-muted dark:text-white/55">Tap to view full photo</p>
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

      {/* Premium background mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(16,185,129,0.14),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(99,102,241,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(16,185,129,0.11),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(99,102,241,0.08),transparent_60%)]" />
      </div>

      {/* HERO */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-slate-950/35"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.26),transparent)] opacity-25" />

        <p className="inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          <IconSpark className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
          Gallery
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-peacock-navy md:text-4xl dark:text-white">
          Workshops, College Training, and Events
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/60">
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
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => selectCategory(ALL_CATEGORY)}
            className={[
              "rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition",
              category === ALL_CATEGORY
                ? "border-peacock-blue bg-peacock-blue text-white"
                : "border-peacock-border/70 bg-white/60 text-peacock-navy hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
            ].join(" ")}
          >
            All ({rows.length})
          </motion.button>

          {GALLERY_CATEGORY_OPTIONS.map((item) => {
            const meta = categoryMeta[item.value];
            const Icon = meta?.icon || IconSpark;
            const active = category === item.value;

            return (
              <motion.button
                key={item.value}
                variants={fadeUp}
                type="button"
                onClick={() => selectCategory(item.value)}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition",
                  active
                    ? "border-peacock-blue bg-peacock-blue text-white"
                    : "border-peacock-border/70 bg-white/60 text-peacock-navy hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                ].join(" ")}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : meta?.tone}`} />
                {item.label} ({counts[item.value] || 0})
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* BODY */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="h-80 rounded-3xl bg-peacock-bg animate-pulse dark:bg-white/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 rounded-3xl border border-peacock-border/60 bg-white/70 p-8 text-center text-sm text-peacock-muted shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 dark:text-white/60"
        >
          No gallery photos in this category yet.
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3"
        >
          {filtered.map((row, index) => {
            const meta = categoryMeta[row.category] || categoryMeta.WORKSHOPS_SEMINARS;
            return (
              <PremiumMasonryCard
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
              initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
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
