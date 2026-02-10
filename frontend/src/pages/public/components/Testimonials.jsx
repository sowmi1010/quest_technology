import { useEffect, useState } from "react";
import { listPublicFeedback } from "../../../services/feedbackApi";
import { IconQuote, IconStar } from "../../../components/ui/PublicIcons";
import { getPublicImageUrl } from "../../../utils/publicUi";

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

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card p-6 text-sm text-peacock-muted">Loading testimonials...</div>
      </section>
    );
  }

  if (!rows.length) return null;

  const averageRating =
    rows.reduce((total, row) => total + Math.max(0, Math.min(5, Number(row.rating || 0))), 0) / rows.length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="badge-soft">Success Stories</p>
          <h2 className="text-2xl font-bold text-peacock-navy md:text-3xl">Student Testimonials</h2>
          <p className="mt-1 text-sm text-peacock-muted">Feedback from learners and placement achievers.</p>
        </div>
        <div className="surface-soft rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-peacock-muted">Average Rating</p>
          <p className="mt-1 text-lg font-bold text-peacock-navy">{averageRating.toFixed(1)} / 5.0</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, index) => {
          const rating = Math.max(0, Math.min(5, Number(row.rating || 0)));

          return (
            <article
              key={row._id}
              className="surface-card hover-tilt animate-fade-up relative overflow-hidden p-6"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="absolute right-5 top-5 rounded-xl bg-peacock-bg p-2 text-peacock-blue">
                <IconQuote className="h-4 w-4" />
              </span>

              <div className="flex items-center gap-4">
                {row.imageUrl ? (
                  <img
                    src={getPublicImageUrl(row.imageUrl)}
                    alt={row.name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-peacock-border"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-peacock-bg font-bold text-peacock-navy ring-2 ring-peacock-border">
                    {row.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}

                <div className="pr-8">
                  <h3 className="font-semibold text-peacock-navy">{row.name || "Student"}</h3>
                  <p className="text-xs text-peacock-muted">{row.course || "Learner"}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} className="h-4 w-4" filled={i < rating} />
                ))}
              </div>

              <p className="mt-3 rounded-2xl bg-peacock-bg/50 p-3 text-sm leading-relaxed text-peacock-ink">
                "{row.feedback}"
              </p>

              {row.company && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-peacock-blue">
                  Placed at {row.company}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
