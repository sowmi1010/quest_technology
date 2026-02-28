import { useEffect, useState } from "react";
import { publicListMou } from "../../../services/mouApi";
import { getPublicImageUrl } from "../../../utils/publicUi";

export default function MouHighlights() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!loading && rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-peacock-border/60 bg-[#dff2f7] p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/35">
        <h2 className="text-center text-2xl font-extrabold text-peacock-navy dark:text-white">
          Partnering for a Better Future (MoU Highlights)
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="h-44 rounded-2xl bg-white/70 animate-pulse" />
              ))
            : rows.map((row) => (
                <article
                  key={row._id}
                  className="rounded-2xl border border-peacock-border/60 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/30"
                >
                  <img
                    src={getPublicImageUrl(row.imageUrl)}
                    alt="MoU Partner"
                    className="h-36 w-full rounded-xl object-contain"
                    loading="lazy"
                  />
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
