import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, FileText, Lock, Play } from "lucide-react";
import { publicGetCourse } from "../../services/courseApi";
import { submitEnquiry } from "../../services/enquiryApi";
import {
  IconArrowRight,
  IconBookOpen,
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconMessageCircle,
  IconPhone,
  IconShield,
  IconSpark,
  IconX,
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
const ENQUIRY_BATCH_OPTIONS = ["Mon/Wed/Fri", "Tue/Thu/Sat", "Weekdays + Sunday"];
const SYLLABUS_UNLOCK_KEY_PREFIX = "quest_syllabus_unlocked_";

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

function onlyDigits(str) {
  return String(str || "").replace(/\D/g, "");
}

function normalizeSyllabusModules(course) {
  const structured = Array.isArray(course?.syllabusModules)
    ? course.syllabusModules
        .map((module, moduleIdx) => {
          const moduleTitle = String(module?.title || "").trim();
          const items = Array.isArray(module?.items)
            ? module.items
                .map((item) => {
                  const title = String(item?.title || "").trim();
                  if (!title) return null;

                  const type = String(item?.type || "LESSON").toUpperCase();
                  return {
                    title,
                    type: type === "PROJECT" ? "PROJECT" : "LESSON",
                  };
                })
                .filter(Boolean)
            : [];

          if (!moduleTitle && items.length === 0) return null;

          return {
            title: moduleTitle || `Module ${moduleIdx + 1}`,
            items,
          };
        })
        .filter(Boolean)
    : [];

  if (structured.length > 0) return structured;

  const legacyTopics = Array.isArray(course?.syllabus)
    ? course.syllabus.map((topic) => String(topic || "").trim()).filter(Boolean)
    : [];

  if (legacyTopics.length === 0) return [];

  return [
    {
      title: "Module 1",
      items: legacyTopics.map((title) => ({ title, type: "LESSON" })),
    },
  ];
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
  const [expandedModuleIndex, setExpandedModuleIndex] = useState(0);
  const [showSyllabusGate, setShowSyllabusGate] = useState(false);
  const [syllabusUnlocked, setSyllabusUnlocked] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateStatus, setGateStatus] = useState({ type: "", message: "" });
  const [gateForm, setGateForm] = useState({
    name: "",
    phone: "",
    preferredBatch: ENQUIRY_BATCH_OPTIONS[0],
    message: "",
  });

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
  const syllabusModules = useMemo(() => normalizeSyllabusModules(course), [course]);
  const syllabusTopicCount = useMemo(
    () => syllabusModules.reduce((sum, module) => sum + module.items.length, 0),
    [syllabusModules]
  );

  const unlockStorageKey = useMemo(
    () => (course?._id ? `${SYLLABUS_UNLOCK_KEY_PREFIX}${course._id}` : ""),
    [course?._id]
  );

  const gatePhoneDigits = useMemo(() => onlyDigits(gateForm.phone).slice(0, 10), [gateForm.phone]);
  const gatePhoneValid = gatePhoneDigits.length === 10;

  useEffect(() => {
    setExpandedModuleIndex(syllabusModules.length > 0 ? 0 : -1);
  }, [id, syllabusModules.length]);

  useEffect(() => {
    if (!unlockStorageKey) {
      setSyllabusUnlocked(false);
      return;
    }

    try {
      setSyllabusUnlocked(window.localStorage.getItem(unlockStorageKey) === "1");
    } catch {
      setSyllabusUnlocked(false);
    }
  }, [unlockStorageKey]);

  const seoTitle = useMemo(() => {
    if (!course?.title) return "Course Details";
    return `${course.title} Course`;
  }, [course?.title]);

  const seoDescription = useMemo(() => {
    if (!course?.title) {
      return "View detailed course information, syllabus, fees, and installment options at Quest Technology.";
    }

    const firstTopics = syllabusModules
      .flatMap((module) => module.items.map((item) => item.title))
      .slice(0, 3)
      .join(", ");

    if (firstTopics) {
      return `${course.title} at Quest Technology. Learn ${firstTopics}. Check duration, fee, and admission details.`;
    }

    return `${course.title} at Quest Technology with practical training, flexible batches, and admission support.`;
  }, [course?.title, syllabusModules]);

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

  const openSyllabusGate = () => {
    if (syllabusModules.length === 0 || syllabusUnlocked) return;

    setGateStatus({ type: "", message: "" });
    setGateForm((prev) => ({
      ...prev,
      message: prev.message || `Please share syllabus details for ${course?.title || "this course"}.`,
    }));
    setShowSyllabusGate(true);
  };

  const closeSyllabusGate = () => {
    if (gateLoading) return;
    setShowSyllabusGate(false);
    setGateStatus({ type: "", message: "" });
  };

  const onGateChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setGateForm((prev) => ({ ...prev, phone: onlyDigits(value).slice(0, 10) }));
      return;
    }

    setGateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitGate = async (e) => {
    e.preventDefault();
    setGateStatus({ type: "", message: "" });

    if (!gatePhoneValid) {
      setGateStatus({ type: "error", message: "Please enter a valid 10-digit phone number." });
      return;
    }

    setGateLoading(true);
    try {
      await submitEnquiry({
        name: String(gateForm.name || "").trim(),
        phone: gatePhoneDigits,
        category: course?.categoryId?.name || "IT",
        course: course?.title || "Course",
        preferredBatch: gateForm.preferredBatch,
        message: String(gateForm.message || "").trim(),
      });

      if (unlockStorageKey) {
        try {
          window.localStorage.setItem(unlockStorageKey, "1");
        } catch {
          // no-op
        }
      }

      setSyllabusUnlocked(true);
      setGateStatus({ type: "success", message: "Enquiry submitted. Syllabus unlocked." });

      window.setTimeout(() => {
        setShowSyllabusGate(false);
        setGateStatus({ type: "", message: "" });
      }, 700);
    } catch {
      setGateStatus({ type: "error", message: "Submission failed. Please try again." });
    } finally {
      setGateLoading(false);
    }
  };

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
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-xl font-extrabold text-peacock-navy dark:text-white">Syllabus Outline</h2>
                <span className="text-xs font-semibold text-peacock-muted dark:text-white/60">
                  {syllabusTopicCount} topic{syllabusTopicCount === 1 ? "" : "s"}
                </span>
              </div>

              {syllabusModules.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 px-4 py-3 text-sm text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                  No syllabus added yet.
                </div>
              ) : !syllabusUnlocked ? (
                <div className="mt-4 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-xl bg-peacock-blue/15 p-2 text-peacock-blue dark:bg-sky-400/10 dark:text-sky-200">
                      <Lock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-peacock-navy dark:text-white">
                        Submit enquiry to view complete syllabus
                      </p>
                      <p className="mt-1 text-xs text-peacock-muted dark:text-white/60">
                        Click below, fill the short enquiry form, and the full module-wise syllabus will open instantly.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openSyllabusGate}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
                  >
                    View Syllabus
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {syllabusModules.map((module, moduleIdx) => {
                    const isOpen = expandedModuleIndex === moduleIdx;
                    const lessonCount = module.items.length;

                    return (
                      <div
                        key={`${module.title}-${moduleIdx}`}
                        className="overflow-hidden rounded-2xl border border-peacock-border/60 bg-white/55 dark:border-white/10 dark:bg-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedModuleIndex(isOpen ? -1 : moduleIdx)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 shrink-0 text-peacock-muted dark:text-white/60" />
                            ) : (
                              <ChevronDown className="h-5 w-5 shrink-0 text-peacock-muted dark:text-white/60" />
                            )}
                            <p className="text-lg font-extrabold text-peacock-navy dark:text-white break-words">
                              {module.title}
                            </p>
                          </div>

                          <div className="shrink-0 inline-flex items-center gap-2 text-sm text-peacock-muted dark:text-white/60">
                            <IconBookOpen className="h-4 w-4" />
                            {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                          </div>
                        </button>

                        {isOpen && (
                          <ul className="space-y-2 border-t border-peacock-border/60 px-4 py-4 sm:px-5 dark:border-white/10">
                            {module.items.map((item, itemIdx) => {
                              const isProject = item.type === "PROJECT";

                              return (
                                <li
                                  key={`${item.title}-${itemIdx}`}
                                  className="flex items-start justify-between gap-3 rounded-xl px-2 py-2"
                                >
                                  <div className="min-w-0 flex items-start gap-3">
                                    <span className="mt-0.5 text-peacock-muted dark:text-white/65">
                                      {isProject ? (
                                        <FileText className="h-5 w-5" />
                                      ) : (
                                        <Play className="h-5 w-5" />
                                      )}
                                    </span>
                                    <span className="text-sm text-peacock-ink dark:text-white/80 break-words">
                                      {item.title}
                                    </span>
                                  </div>

                                  <span
                                    className={[
                                      "shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em]",
                                      isProject
                                        ? "bg-violet-200/70 text-violet-800 dark:bg-violet-300/20 dark:text-violet-200"
                                        : "bg-amber-200/80 text-amber-800 dark:bg-amber-300/20 dark:text-amber-100",
                                    ].join(" ")}
                                  >
                                    {item.type}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
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
              {!syllabusUnlocked && syllabusModules.length > 0 && (
                <button
                  type="button"
                  onClick={openSyllabusGate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-peacock-border/70 bg-white/60 px-5 py-3 text-sm font-extrabold text-peacock-navy
                           transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  View Syllabus
                </button>
              )}

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
              <MiniStat title="Topics" value={`${syllabusTopicCount || 0}+`} />
            </div>
          </motion.div>
        </motion.aside>
      </div>

      {showSyllabusGate && (
        <div className="fixed inset-0 z-50 px-4 py-6 sm:p-8">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeSyllabusGate}
            aria-label="Close"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            className="relative mx-auto mt-6 w-full max-w-xl rounded-3xl border border-peacock-border/60 bg-white/95 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-peacock-navy dark:text-white">View Full Syllabus</h3>
                <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">
                  Submit quick enquiry to unlock module-wise syllabus.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSyllabusGate}
                className="inline-flex rounded-xl border border-peacock-border/60 bg-peacock-bg/70 p-2 text-peacock-muted transition hover:bg-peacock-bg dark:border-white/10 dark:bg-white/5 dark:text-white/70"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmitGate} className="mt-5 space-y-4">
              <Field label="Course">
                <input value={course?.title || ""} readOnly className="input-control cursor-not-allowed opacity-90" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <input
                    name="name"
                    value={gateForm.name}
                    onChange={onGateChange}
                    className="input-control"
                    placeholder="Your name"
                    required
                  />
                </Field>

                <Field label="Phone Number" hint="10-digit number">
                  <input
                    name="phone"
                    value={gateForm.phone}
                    onChange={onGateChange}
                    className={`input-control ${gateForm.phone && !gatePhoneValid ? "!border-red-300 !ring-red-200/40" : ""}`}
                    placeholder="9876543210"
                    inputMode="numeric"
                    required
                  />
                </Field>
              </div>

              <Field label="Preferred Batch">
                <select
                  name="preferredBatch"
                  value={gateForm.preferredBatch}
                  onChange={onGateChange}
                  className="select-control"
                >
                  {ENQUIRY_BATCH_OPTIONS.map((batch) => (
                    <option key={batch}>{batch}</option>
                  ))}
                </select>
              </Field>

              <Field label="Message (Optional)">
                <textarea
                  name="message"
                  value={gateForm.message}
                  onChange={onGateChange}
                  className="input-control min-h-24 resize-y"
                  rows={3}
                  placeholder="Share your preferred timing or goal"
                />
              </Field>

              {gateStatus.message && (
                <div
                  className={[
                    "rounded-2xl border px-4 py-3 text-sm font-semibold",
                    gateStatus.type === "success"
                      ? "border-peacock-green/30 bg-peacock-green/10 text-peacock-green dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                      : "border-red-300 bg-red-50 text-red-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-200",
                  ].join(" ")}
                >
                  {gateStatus.message}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeSyllabusGate}
                  className="inline-flex items-center justify-center rounded-2xl border border-peacock-border/70 bg-white/70 px-4 py-3 text-sm font-extrabold text-peacock-navy transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  disabled={gateLoading || !gatePhoneValid}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                >
                  {gateLoading ? "Submitting..." : "Submit and View Syllabus"}
                  {!gateLoading && <IconArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Components ----------------------------- */

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

function Field({ label, hint, children }) {
  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-peacock-navy dark:text-white">{label}</span>
        {hint ? (
          <span className="text-xs font-semibold text-peacock-muted dark:text-white/50">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  );
}
