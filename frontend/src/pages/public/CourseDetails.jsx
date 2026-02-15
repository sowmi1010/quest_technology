import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicGetCourse } from "../../services/courseApi";
import {
  IconArrowRight,
  IconBookOpen,
  IconBriefcase,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconMessageCircle,
  IconPhone,
  IconShield,
} from "../../components/ui/PublicIcons";
import {
  INSTALLMENT_START,
  PUBLIC_CONTACT,
  formatINR,
  getPublicImageUrl,
} from "../../utils/publicUi";
import PublicSeo from "../../components/seo/PublicSeo";

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
        <div className="h-5 w-40 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="mt-5 h-72 w-full rounded-3xl bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="mt-6 h-7 w-2/3 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="mt-3 h-4 w-1/2 rounded bg-peacock-bg animate-pulse dark:bg-white/10" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-peacock-bg animate-pulse dark:bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await publicGetCourse(id);
        setCourse(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const img = useMemo(() => getPublicImageUrl(course?.imageUrl), [course]);
  const syllabus = useMemo(() => (Array.isArray(course?.syllabus) ? course.syllabus : []), [course]);
  const seoTitle = useMemo(() => {
    if (!course?.title) return "Course Details";
    return `${course.title} Course`;
  }, [course?.title]);

  const seoDescription = useMemo(() => {
    if (!course?.title) {
      return "View detailed course information, syllabus, fees, and installment options at Quest Technology.";
    }

    const firstTopics = Array.isArray(course.syllabus)
      ? course.syllabus.slice(0, 3).filter(Boolean).join(", ")
      : "";

    if (firstTopics) {
      return `${course.title} at Quest Technology. Learn ${firstTopics}. Check duration, fee, and admission details.`;
    }

    return `${course.title} at Quest Technology with practical training, flexible batches, and admission support.`;
  }, [course]);

  const seoKeywords = useMemo(() => {
    const category = course?.categoryId?.name ? `${course.categoryId.name}, ` : "";
    const title = course?.title ? `${course.title}, ` : "";
    return `${title}${category}Quest Technology courses, skill training`;
  }, [course?.categoryId?.name, course?.title]);

  const courseSchema = useMemo(() => {
    if (!course?.title) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: seoDescription,
      provider: {
        "@type": "Organization",
        name: "Quest Technology",
      },
      courseMode: "onsite",
    };
  }, [course?.title, seoDescription]);

  if (loading) {
    return (
      <>
        <PublicSeo
          title={seoTitle}
          description={seoDescription}
          keywords={seoKeywords}
          canonicalPath={`/courses/${id}`}
        />
        <Skeleton />
      </>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PublicSeo
          title={seoTitle}
          description={seoDescription}
          keywords={seoKeywords}
          canonicalPath={`/courses/${id}`}
          robots="noindex,follow"
        />

        <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
          <div className="text-sm text-peacock-muted dark:text-white/60">Course not found.</div>
          <Link
            to="/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 px-4 py-2 text-sm font-semibold text-peacock-navy hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <IconArrowRight className="h-4 w-4 rotate-180" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PublicSeo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/courses/${id}`}
        image={img || "/logo.jpeg"}
        type="article"
        jsonLd={courseSchema}
      />

      {/* Back */}
      <div className="mb-5">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-peacock-blue transition hover:text-peacock-navy dark:text-sky-200 dark:hover:text-white"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
          Back to courses
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_0.95fr]">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
          {/* Ink Blue + Green glow */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />

          {/* Image */}
          {img ? (
            <div className="relative">
              <img src={img} alt={course.title} className="h-72 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-peacock-bg text-peacock-muted dark:bg-white/5 dark:text-white/60">
              <IconBookOpen className="h-8 w-8" />
            </div>
          )}

          <div className="p-6">
            {/* Category chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                {course.categoryId?.name || "Category"}
              </span>

              {course.isPublic ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-peacock-green/10 px-3 py-1 text-[11px] font-bold text-peacock-green dark:bg-emerald-400/10 dark:text-emerald-200">
                  <IconShield className="h-4 w-4" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-peacock-blue/10 px-3 py-1 text-[11px] font-bold text-peacock-blue dark:bg-sky-400/10 dark:text-sky-200">
                  <IconShield className="h-4 w-4" />
                  Private
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold text-peacock-navy md:text-4xl dark:text-white">
              {course.title}
            </h1>

            <p className="mt-2 text-sm text-peacock-muted dark:text-white/60">
              A practical, outcome-focused program with guided modules and real support.
            </p>

            {/* Info Grid */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoBox
                icon={<IconClock className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                label="Duration"
                value={course.duration || "Flexible"}
              />
              <InfoBox
                icon={<IconBriefcase className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                label="Total Fee"
                value={formatINR(course.totalFee)}
              />
              <InfoBox
                icon={<IconCalendar className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                label="Installment Start"
                value={formatINR(course.installmentStart ?? INSTALLMENT_START)}
              />
              <InfoBox
                icon={<IconShield className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                label="Admission"
                value="Open"
              />
            </div>

            {/* Syllabus */}
            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-xl font-bold text-peacock-navy dark:text-white">Syllabus Outline</h2>
                <span className="text-xs font-semibold text-peacock-muted dark:text-white/60">
                  {syllabus.length} topics
                </span>
              </div>

              {syllabus.length ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {syllabus.map((item, idx) => (
                    <li
                      key={`${item}-${idx}`}
                      className="group flex items-start gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-3 py-3 text-sm text-peacock-ink
                                 transition hover:-translate-y-0.5 hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                    >
                      <span className="mt-0.5 rounded-xl bg-peacock-green/15 p-1 text-peacock-green dark:bg-emerald-400/10 dark:text-emerald-200">
                        <IconCheckCircle className="h-4 w-4" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 px-4 py-3 text-sm text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                  No syllabus added yet.
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/enquiry"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white
                           shadow-[0_18px_45px_-25px_rgba(56,189,248,0.55)]
                           transition hover:brightness-110 active:scale-[0.98]"
              >
                Enquiry Now
                <IconArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-2xl border border-peacock-border/70 bg-white/60 px-5 py-3 text-sm font-extrabold text-peacock-navy
                           transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Back to Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-5">
          {/* Sticky Contact */}
          <div className="sticky top-24 rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
            <h2 className="text-lg font-extrabold text-peacock-navy dark:text-white">Need guidance?</h2>
            <p className="mt-2 text-sm leading-relaxed text-peacock-muted dark:text-white/60">
              Contact our team for batch timings, fee plans, and admission support.
            </p>

            <div className="mt-4 grid gap-3">
              <a
                href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-peacock-border/70 bg-white/60 px-4 py-3 text-sm font-extrabold text-peacock-navy
                           transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" />
                Call {PUBLIC_CONTACT.phoneDisplay}
              </a>

              <a
                href={PUBLIC_CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peacock-green px-4 py-3 text-sm font-extrabold text-white
                           transition hover:brightness-110 active:scale-[0.98]"
              >
                <IconMessageCircle className="h-4 w-4" />
                WhatsApp Chat
              </a>
            </div>

            <div className="mt-4 rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs text-peacock-muted dark:text-white/60">Installment plans start from</p>
              <p className="mt-1 text-lg font-extrabold text-peacock-navy dark:text-white">
                {formatINR(INSTALLMENT_START)}
              </p>
            </div>
          </div>

          {/* What you get */}
          <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
            <h3 className="font-extrabold text-peacock-navy dark:text-white">What you get</h3>
            <ul className="mt-3 space-y-2 text-sm text-peacock-muted dark:text-white/60">
              <Bullet>
                Structured modules with practical sessions
              </Bullet>
              <Bullet>
                Mentor support and regular progress checks
              </Bullet>
              <Bullet>
                Career and interview guidance
              </Bullet>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 rounded-xl bg-peacock-green/15 p-1 text-peacock-green dark:bg-emerald-400/10 dark:text-emerald-200">
        <IconCheckCircle className="h-4 w-4" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-peacock-muted dark:text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-extrabold text-peacock-navy dark:text-white">{value}</div>
    </div>
  );
}
