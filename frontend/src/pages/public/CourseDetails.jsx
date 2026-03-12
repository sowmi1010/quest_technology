import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
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
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
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
                  return { title, type: type === "PROJECT" ? "PROJECT" : "LESSON" };
                })
                .filter(Boolean)
            : [];

          if (!moduleTitle && items.length === 0) return null;
          return { title: moduleTitle || `Module ${moduleIdx + 1}`, items };
        })
        .filter(Boolean)
    : [];

  if (structured.length > 0) return structured;

  const legacyTopics = Array.isArray(course?.syllabus)
    ? course.syllabus.map((topic) => String(topic || "").trim()).filter(Boolean)
    : [];

  if (legacyTopics.length === 0) return [];

  return [{ title: "Module 1", items: legacyTopics.map((title) => ({ title, type: "LESSON" })) }];
}

/* ----------------------------- Premium UI ----------------------------- */

function PremiumShell({ children }) {
  return (
    <div className="relative overflow-x-hidden">
      {/* Neo mesh background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.11),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      {/* soft noise overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />

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

function GlowDivider() {
  return (
    <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
  );
}

/* ----------------------------- Skeleton ----------------------------- */

function Skeleton() {
  return (
    <PremiumShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <NeoCard className="p-6">
          <div className="h-5 w-44 rounded bg-black/5 animate-pulse dark:bg-white/10" />
          <div className="mt-5 h-72 w-full rounded-3xl bg-black/5 animate-pulse dark:bg-white/10" />
          <div className="mt-6 h-8 w-2/3 rounded bg-black/5 animate-pulse dark:bg-white/10" />
          <div className="mt-3 h-4 w-1/2 rounded bg-black/5 animate-pulse dark:bg-white/10" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
            ))}
          </div>
        </NeoCard>
      </div>
    </PremiumShell>
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

  const seoTitle = useMemo(
    () => (course?.title ? `${course.title} Course` : "Course Details"),
    [course?.title]
  );

  const seoDescription = useMemo(() => {
    if (!course?.title) {
      return "View detailed course information, syllabus, fees, and installment options at Quest Technology.";
    }
    const firstTopics = syllabusModules
      .flatMap((module) => module.items.map((item) => item.title))
      .slice(0, 3)
      .join(", ");
    return firstTopics
      ? `${course.title} at Quest Technology. Learn ${firstTopics}. Check duration, fee, and admission details.`
      : `${course.title} at Quest Technology with practical training, flexible batches, and admission support.`;
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
        <PublicSeo title={seoTitle} description={seoDescription} keywords={seoKeywords} canonicalPath={`/courses/${id}`} />
        <Skeleton />
      </>
    );
  }

  if (!course) {
    return (
      <PremiumShell>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <PublicSeo
            title={seoTitle}
            description={seoDescription}
            keywords={seoKeywords}
            canonicalPath={`/courses/${id}`}
            robots="noindex,follow"
          />
          <NeoCard className="p-6">
            <div className="text-sm text-slate-600 dark:text-white/60">Course not found.</div>
            <Link
              to="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <IconArrowRight className="h-4 w-4 rotate-180" />
              Back to Courses
            </Link>
          </NeoCard>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
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

        {/* Premium header strip (NO back button, as you requested) */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>
                <IconSpark className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                Course Details
              </Pill>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/60 px-3 py-1 text-[11px] font-extrabold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <IconShield className="h-4 w-4" />
                {course.isPublic ? "Public" : "Private"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={PUBLIC_CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
              >
                <IconMessageCircle className="h-4 w-4" />
                WhatsApp
              </a>

              <a
                href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" />
                Call
              </a>
            </div>
          </div>
        </motion.div>

        {/* Layout */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,0.95fr)]">
          {/* MAIN */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <NeoCard className="min-w-0">
              {/* Image */}
              {img ? (
                <motion.div variants={fade} initial="hidden" animate="show" className="relative overflow-hidden">
                  <motion.img
                    src={img}
                    alt={course.title}
                    className="h-72 w-full object-cover"
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1.0 }}
                    transition={{ duration: 0.9, ease }}
                    whileHover={{ scale: 1.03 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* top badges */}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Pill>
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                      {course.categoryId?.name || "Category"}
                    </Pill>
                  </div>

                  {/* title overlay for premium */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {course.title}
                    </h1>
                    <p className="mt-1 text-sm text-white/80">
                      Practical training • Guided sessions • Career support
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-72 items-center justify-center bg-black/5 text-slate-500 dark:bg-white/5 dark:text-white/60">
                  <IconBookOpen className="h-8 w-8" />
                </div>
              )}

              <div className="p-6">
                {/* If image exists, title already shown on image — show small subtitle here */}
                {img ? (
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-white/60">
                    Learn with hands-on practice, guided sessions, and career-oriented support.
                  </p>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                      {course.title}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/60">
                      Learn with hands-on practice, guided sessions, and career-oriented support.
                    </p>
                  </>
                )}

                <GlowDivider />

                {/* Stats */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <motion.div variants={fadeUp}>
                    <InfoBox
                      icon={<IconClock className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />}
                      label="Duration"
                      value={course.duration || "Flexible"}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <InfoBox
                      icon={<IconBriefcase className="h-4 w-4 text-violet-700 dark:text-violet-300" />}
                      label="Total Fee"
                      value={formatINR(course.totalFee)}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <InfoBox
                      icon={<IconCalendar className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />}
                      label="Installment Start"
                      value={formatINR(course.installmentStart ?? INSTALLMENT_START)}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <InfoBox
                      icon={<IconShield className="h-4 w-4 text-violet-700 dark:text-violet-300" />}
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
                  className="mt-10"
                >
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Syllabus Outline
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 dark:text-white/60">
                      {syllabusTopicCount} topic{syllabusTopicCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  {syllabusModules.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                      No syllabus added yet.
                    </div>
                  ) : !syllabusUnlocked ? (
                    <div className="mt-4 rounded-2xl border border-white/14 bg-white/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-xl border border-white/14 bg-white/60 p-2 text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300">
                          <Lock className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Submit enquiry to view complete syllabus
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
                            Fill a short form and the full module-wise syllabus opens instantly.
                          </p>
                        </div>
                      </div>

                      {/* ✅ Only ONE "View Syllabus" button (kept here) */}
                      <button
                        type="button"
                        onClick={openSyllabusGate}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
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
                            className="overflow-hidden rounded-2xl border border-white/14 bg-white/60 dark:border-white/10 dark:bg-white/5"
                          >
                            <button
                              type="button"
                              onClick={() => setExpandedModuleIndex(isOpen ? -1 : moduleIdx)}
                              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                            >
                              <div className="min-w-0 flex items-center gap-3">
                                {isOpen ? (
                                  <ChevronUp className="h-5 w-5 shrink-0 text-slate-500 dark:text-white/60" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 dark:text-white/60" />
                                )}
                                <p className="text-lg font-extrabold text-slate-900 dark:text-white break-words">
                                  {module.title}
                                </p>
                              </div>

                              <div className="shrink-0 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                                <IconBookOpen className="h-4 w-4" />
                                {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                              </div>
                            </button>

                            {isOpen && (
                              <ul className="space-y-2 border-t border-white/14 px-4 py-4 sm:px-5 dark:border-white/10">
                                {module.items.map((item, itemIdx) => {
                                  const isProject = item.type === "PROJECT";
                                  return (
                                    <li
                                      key={`${item.title}-${itemIdx}`}
                                      className="flex items-start justify-between gap-3 rounded-xl px-2 py-2 hover:bg-white/50 dark:hover:bg-white/5"
                                    >
                                      <div className="min-w-0 flex items-start gap-3">
                                        <span className="mt-0.5 text-slate-500 dark:text-white/65">
                                          {isProject ? (
                                            <FileText className="h-5 w-5" />
                                          ) : (
                                            <Play className="h-5 w-5" />
                                          )}
                                        </span>
                                        <span className="text-sm text-slate-800 dark:text-white/80 break-words">
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

                {/* ✅ CTA (Removed duplicate View Syllabus + Removed Back to Courses) */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  className="mt-10"
                >
                  <div className="rounded-3xl border border-white/12 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600 dark:text-white/60">
                          Admissions Open
                        </p>
                        <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                          Want batch timing + fee plan details?
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                          Send an enquiry — our team will contact you soon.
                        </p>
                      </div>

                      <Link
                        to="/enquiry"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-extrabold text-white
                                   shadow-[0_18px_50px_-28px_rgba(34,211,238,0.55)]
                                   transition hover:brightness-110 active:scale-[0.98]"
                      >
                        Enquiry Now
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </NeoCard>
          </motion.div>

          {/* SIDEBAR */}
          <motion.aside variants={stagger} initial="hidden" animate="show" className="space-y-5 min-w-0">
            <motion.div variants={fadeUp} className="lg:sticky lg:top-24">
              <NeoCard className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Need guidance?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/60">
                      Batch timings, fee plans, and admission support.
                    </p>
                  </div>

                  <span className="inline-flex rounded-2xl border border-white/12 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                    <IconSpark className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  <a
                    href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm font-extrabold text-slate-900
                               transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <IconPhone className="h-4 w-4" />
                    Call {PUBLIC_CONTACT.phoneDisplay}
                  </a>

                  <a
                    href={PUBLIC_CONTACT.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-extrabold text-white
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

                {/* Optional small note */}
                <p className="mt-4 text-xs text-slate-500 dark:text-white/50">
                  Available for quick support via call/WhatsApp.
                </p>
              </NeoCard>
            </motion.div>
          </motion.aside>
        </div>

        {/* SYLLABUS GATE MODAL */}
        <AnimatePresence>
          {showSyllabusGate && (
            <motion.div
              className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSyllabusGate}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/12 bg-white/85 shadow-2xl backdrop-blur-2xl dark:bg-slate-950/80 dark:border-white/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white/40 p-5 dark:bg-white/5">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600 dark:text-white/60">
                      Syllabus Access
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                      View Full Syllabus
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                      Submit quick enquiry to unlock module-wise syllabus.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeSyllabusGate}
                    className="inline-flex rounded-2xl border border-white/12 bg-white/60 p-2 text-slate-700 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <form onSubmit={onSubmitGate} className="p-5 space-y-4">
                  <Field label="Course">
                    <input
                      value={course?.title || ""}
                      readOnly
                      className="input-control cursor-not-allowed opacity-90"
                    />
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
                        className={`input-control ${
                          gateForm.phone && !gatePhoneValid ? "!border-red-300 !ring-red-200/40" : ""
                        }`}
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
                          ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"
                          : "border-rose-300/25 bg-rose-400/10 text-rose-700 dark:text-rose-200",
                      ].join(" ")}
                    >
                      {gateStatus.message}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeSyllabusGate}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={gateLoading || !gatePhoneValid}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                    >
                      {gateLoading ? "Submitting..." : "Submit and View Syllabus"}
                      {!gateLoading && <IconArrowRight className="h-4 w-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-white/50">
                    We will contact you via call/WhatsApp for admission guidance.
                  </p>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumShell>
  );
}

/* ----------------------------- Components ----------------------------- */

function InfoBox({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5 min-w-0">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-600 dark:text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white break-words">
        {value}
      </div>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-white/60">
        {title}
      </p>
      <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-900 dark:text-white">{label}</span>
        {hint ? (
          <span className="text-xs font-semibold text-slate-500 dark:text-white/50">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  );
}