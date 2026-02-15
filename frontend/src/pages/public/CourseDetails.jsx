import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
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
  IconSpark,
} from "../../components/ui/PublicIcons";
import {
  INSTALLMENT_START,
  PUBLIC_CONTACT,
  formatINR,
  getPublicImageUrl,
} from "../../utils/publicUi";
import PublicSeo from "../../components/seo/PublicSeo";

/* ----------------------------- Motion ----------------------------- */

const ease = [0.16, 1, 0.3, 1];

function useMotion() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  const fade = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.65, ease } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
  };

  return { reduce, fadeUp, fade, stagger };
}

/* ----------------------------- Skeleton ----------------------------- */

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 overflow-x-hidden">
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

/* ----------------------------- Page ----------------------------- */

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fadeUp, fade, stagger } = useMotion();

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
      provider: { "@type": "Organization", name: "Quest Technology" },
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 overflow-x-hidden">
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 overflow-x-hidden">
      <PublicSeo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/courses/${id}`}
        image={img || "/logo.jpeg"}
        type="article"
        jsonLd={courseSchema}
      />

      {/* Premium background mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(16,185,129,0.14),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(99,102,241,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(16,185,129,0.11),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(99,102,241,0.08),transparent_60%)]" />
      </div>

      {/* Back */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-5">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-peacock-blue transition hover:text-peacock-navy dark:text-sky-200 dark:hover:text-white"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
          Back to courses
        </Link>
      </motion.div>

      {/* Layout */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,0.95fr)]">
        {/* MAIN */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="group relative min-w-0 overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10"
        >
          {/* glows */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />
          {/* shine */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.32),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />

          {/* Image */}
          {img ? (
            <motion.div variants={fade} initial="hidden" animate="show" className="relative overflow-hidden">
              <motion.img
                src={img}
                alt={course.title}
                className="h-72 w-full object-cover"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.0 }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ scale: 1.03 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            </motion.div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-peacock-bg text-peacock-muted dark:bg-white/5 dark:text-white/60">
              <IconBookOpen className="h-8 w-8" />
            </div>
          )}

          <div className="p-6">
            {/* Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                {course.categoryId?.name || "Category"}
              </span>

              {course.isPublic ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-peacock-green/10 px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] text-peacock-green dark:bg-emerald-400/10 dark:text-emerald-200">
                  <IconShield className="h-4 w-4" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-peacock-blue/10 px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] text-peacock-blue dark:bg-sky-400/10 dark:text-sky-200">
                  <IconShield className="h-4 w-4" />
                  Private
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-peacock-navy md:text-4xl dark:text-white">
              {course.title}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-peacock-muted dark:text-white/60">
              Learn with hands-on practice, guided sessions, and career-oriented support.
            </p>

            {/* Info Grid (animated) */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-5 grid gap-3 sm:grid-cols-2"
            >
              <motion.div variants={fadeUp}>
                <InfoBox
                  icon={<IconClock className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                  label="Duration"
                  value={course.duration || "Flexible"}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <InfoBox
                  icon={<IconBriefcase className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                  label="Total Fee"
                  value={formatINR(course.totalFee)}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <InfoBox
                  icon={<IconCalendar className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                  label="Installment Start"
                  value={formatINR(course.installmentStart ?? INSTALLMENT_START)}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <InfoBox
                  icon={<IconShield className="h-4 w-4 text-peacock-blue dark:text-sky-200" />}
                  label="Admission"
                  value="Open"
                />
              </motion.div>
            </motion.div>

            {/* Syllabus */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-8"
            >
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-xl font-extrabold text-peacock-navy dark:text-white">Syllabus Outline</h2>
                <span className="text-xs font-semibold text-peacock-muted dark:text-white/60">
                  {syllabus.length} topics
                </span>
              </div>

              {syllabus.length ? (
                <motion.ul
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  className="mt-4 grid gap-2 sm:grid-cols-2"
                >
                  {syllabus.map((item, idx) => (
                    <motion.li
                      key={`${item}-${idx}`}
                      variants={fadeUp}
                      whileHover={{ y: -3 }}
                      className="group flex min-w-0 items-start gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-3 py-3 text-sm text-peacock-ink
                                 transition dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                    >
                      <span className="mt-0.5 shrink-0 rounded-xl bg-peacock-green/15 p-1 text-peacock-green dark:bg-emerald-400/10 dark:text-emerald-200">
                        <IconCheckCircle className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 break-words">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <div className="mt-3 rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 px-4 py-3 text-sm text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                  No syllabus added yet.
                </div>
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-7 flex flex-wrap gap-3"
            >
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
            </motion.div>
          </div>
        </motion.div>

        {/* SIDEBAR */}
        <motion.aside
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-5 min-w-0 overflow-hidden"
        >
          {/* Sticky Contact */}
          <motion.div
            variants={fadeUp}
            className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10 lg:sticky lg:top-24 min-w-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-peacock-navy dark:text-white">Need guidance?</h2>
                <p className="mt-2 text-sm leading-relaxed text-peacock-muted dark:text-white/60">
                  Batch timings, fee plans, and admission support.
                </p>
              </div>

              <span className="inline-flex rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 p-2 dark:border-white/10 dark:bg-white/5">
                <IconSpark className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              <a
                href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-peacock-border/70 bg-white/60
                           px-4 py-3 text-sm font-extrabold text-peacock-navy text-center leading-snug break-words
                           transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" />
                Call {PUBLIC_CONTACT.phoneDisplay}
              </a>

              <a
                href={PUBLIC_CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-peacock-green px-4 py-3 text-sm font-extrabold text-white
                           transition hover:brightness-110 active:scale-[0.98]"
              >
                <IconMessageCircle className="h-4 w-4" />
                WhatsApp Chat
              </a>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MiniStat title="Installment from" value={formatINR(INSTALLMENT_START)} />
              <MiniStat title="Topics" value={`${syllabus.length || 0}+`} />
            </div>
          </motion.div>

          
        </motion.aside>
      </div>
    </div>
  );
}

/* ----------------------------- Components ----------------------------- */

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2 min-w-0">
      <span className="mt-0.5 shrink-0 rounded-xl bg-peacock-green/15 p-1 text-peacock-green dark:bg-emerald-400/10 dark:text-emerald-200">
        <IconCheckCircle className="h-4 w-4" />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 dark:border-white/10 dark:bg-white/5 min-w-0">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-peacock-muted dark:text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-extrabold text-peacock-navy dark:text-white break-words">
        {value}
      </div>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-muted dark:text-white/60">
        {title}
      </p>
      <p className="mt-1 text-lg font-extrabold text-peacock-navy dark:text-white">{value}</p>
    </div>
  );
}
