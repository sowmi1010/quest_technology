import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconCalendar,
  IconGraduationCap,
  IconSpark,
  IconX,
} from "../../components/ui/PublicIcons";
import { publicListGallery } from "../../services/galleryApi";
import { getPublicImageUrl } from "../../utils/publicUi";
import { GALLERY_CATEGORY_OPTIONS, getGalleryCategoryLabel } from "../../utils/galleryCategories";

const ALL_CATEGORY = "ALL";

const categoryMeta = {
  WORKSHOPS_SEMINARS: {
    icon: IconSpark,
    tone: "text-peacock-blue dark:text-sky-200",
    chip: "from-peacock-blue/15 to-peacock-green/15",
  },
  HANDS_ON_COLLEGE_TRAINING: {
    icon: IconGraduationCap,
    tone: "text-peacock-green dark:text-emerald-200",
    chip: "from-peacock-green/15 to-peacock-blue/15",
  },
  EVENTS: {
    icon: IconCalendar,
    tone: "text-peacock-blue dark:text-sky-200",
    chip: "from-peacock-blue/15 to-peacock-green/15",
  },
};

function categoryCountMap(rows) {
  return rows.reduce(
    (acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    },
    {}
  );
}

export default function Gallery() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [selected, setSelected] = useState(null);

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

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-slate-950/35">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />

        <p className="inline-flex items-center rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          Gallery
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-peacock-navy md:text-4xl dark:text-white">
          Workshops, College Training, and Events
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/60">
          Explore moments from our workshops, seminars, hands-on sessions in colleges, and campus events.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(ALL_CATEGORY)}
            className={[
              "rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition",
              category === ALL_CATEGORY
                ? "border-peacock-blue bg-peacock-blue text-white"
                : "border-peacock-border/70 bg-white/60 text-peacock-navy hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
            ].join(" ")}
          >
            All ({rows.length})
          </button>

          {GALLERY_CATEGORY_OPTIONS.map((item) => {
            const meta = categoryMeta[item.value];
            const Icon = meta?.icon || IconSpark;
            const active = category === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition",
                  active
                    ? "border-peacock-blue bg-peacock-blue text-white"
                    : "border-peacock-border/70 bg-white/60 text-peacock-navy hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                ].join(" ")}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : meta?.tone}`} />
                {item.label} ({counts[item.value] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-80 rounded-3xl bg-peacock-bg animate-pulse dark:bg-white/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-peacock-border/60 bg-white/70 p-8 text-center text-sm text-peacock-muted shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 dark:text-white/60">
          No gallery photos in this category yet.
        </div>
      ) : (
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((row, index) => {
            const meta = categoryMeta[row.category] || categoryMeta.WORKSHOPS_SEMINARS;
            const Icon = meta.icon;

            return (
              <article
                key={row._id}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:border-peacock-blue/40 dark:border-white/10 dark:bg-slate-950/35"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(row)}
                  className="block w-full text-left"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getPublicImageUrl(row.imageUrl)}
                      alt={row.title || getGalleryCategoryLabel(row.category)}
                      className="w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-95" />
                    <span
                      className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-gradient-to-r ${meta.chip} px-3 py-1 text-[11px] font-extrabold text-white`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {getGalleryCategoryLabel(row.category)}
                    </span>
                  </div>

                  <div className="p-4">
                    <h2 className="text-base font-extrabold text-peacock-navy dark:text-white">
                      {row.title?.trim() || "Quest Gallery Update"}
                    </h2>

                    {row.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-peacock-muted dark:text-white/65">
                        {row.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-peacock-muted dark:text-white/55">
                        Tap to view full photo
                      </p>
                    )}
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-2xl border border-white/25 bg-black/40 p-2 text-white transition hover:bg-black/60"
              >
                <IconX className="h-5 w-5" />
              </button>

              <img
                src={getPublicImageUrl(selected.imageUrl)}
                alt={selected.title || getGalleryCategoryLabel(selected.category)}
                className="max-h-[75vh] w-full object-contain bg-black/40"
              />

              <div className="border-t border-white/10 bg-black/35 p-4 text-white">
                <p className="text-sm font-extrabold">
                  {selected.title?.trim() || getGalleryCategoryLabel(selected.category)}
                </p>
                {selected.description ? (
                  <p className="mt-1 text-sm text-white/75">{selected.description}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
