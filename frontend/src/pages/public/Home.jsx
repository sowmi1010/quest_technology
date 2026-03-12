import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { publicGetCourses } from "../../services/courseApi";
import {
  IconArrowRight,
  IconBookOpen,
  IconBriefcase,
  IconCalculator,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconGraduationCap,
  IconLaptop,
  IconMessageCircle,
  IconPhone,
  IconSpark,
  IconUsers,
  IconWrench,
} from "../../components/ui/PublicIcons";
import {
  INSTALLMENT_START,
  PUBLIC_CONTACT,
  formatINR,
  getPublicImageUrl,
} from "../../utils/publicUi";
import Testimonials from "./components/Testimonials";
import MouHighlights from "./components/MouHighlights";
import FounderVision from "./components/FounderVision";
import PublicSeo from "../../components/seo/PublicSeo";

/* ----------------------------- DATA ----------------------------- */

const highlights = [
  { title: "IT Programs", text: "Full Stack, AWS, and Digital Marketing with project-first training.", icon: IconLaptop },
  { title: "Accounts Programs", text: "Tally, SAP, and MS Office modules aligned with real office workflows.", icon: IconCalculator },
  { title: "Mechanical Tools", text: "Hands-on Creo, SolidWorks, and AutoCAD sessions.", icon: IconWrench },
  { title: "Tuition + Exam Track", text: "Grades 6 to 12 with JEE and NEET support.", icon: IconGraduationCap },
];

const categoryCards = [
  { title: "IT", desc: "Software and cloud programs for job-ready skills.", icon: IconLaptop },
  { title: "Mechanical", desc: "Design and drafting tool mastery with guided practice.", icon: IconWrench },
  { title: "Accounts", desc: "Finance + business software training with practical use cases.", icon: IconCalculator },
  { title: "Tuition", desc: "Structured subject support for state board students.", icon: IconBookOpen },
  { title: "JEE / NEET", desc: "Concept revision, mock tests, and exam mentoring.", icon: IconGraduationCap },
];

const batches = [
  { name: "Batch A", days: "Monday, Wednesday, Friday", note: "Ideal for working learners and steady progress." },
  { name: "Batch B", days: "Tuesday, Thursday, Saturday", note: "Balanced schedule for college students." },
  { name: "Batch C", days: "Weekdays plus Sunday", note: "Fast-track option with extra support." },
];

const assurances = [
  "Installment plans from ₹5,000",
  "Three batch patterns with flexible timing",
  "Placement and interview guidance",
];

const keyAchievements = [
  { value: 18, suffix: "+", label: "Years of Excellence", icon: IconSpark },
  { value: 13, suffix: "+", label: "College Collaborations", icon: IconGraduationCap },
  { value: 500, suffix: "+", label: "Workshops", icon: IconLaptop },
  { value: 200, suffix: "+", label: "Seminars", icon: IconCalendar },
  { value: 1000, suffix: "+", label: "Students Learning", icon: IconUsers },
];

/* ----------------------------- ANIM HELPERS ----------------------------- */

const easeOut = [0.16, 1, 0.3, 1];

function useMotionVariants() {
  const reduce = useReducedMotion();

  return useMemo(() => {
    const fadeUp = {
      hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.65, ease: easeOut },
      },
    };

    const stagger = {
      hidden: {},
      show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
    };

    const hoverLift = reduce
      ? {}
      : {
          whileHover: { y: -8, scale: 1.01, transition: { duration: 0.22, ease: easeOut } },
          whileTap: { scale: 0.99 },
        };

    return { fadeUp, stagger, hoverLift, reduce };
  }, [reduce]);
}

/* ----------------------------- UI PRIMITIVES (Neo Luxury) ----------------------------- */

function Shell({ children }) {
  return <div className="relative pb-12">{children}</div>;
}

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
      {/* subtle neon stroke */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-xl dark:bg-white/5 dark:text-white/70 dark:border-white/10">
      {children}
    </span>
  );
}

function PrimaryBtn({ to, children }) {
  return (
    <motion.div whileTap={{ scale: 0.99 }}>
      <Link
        to={to}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500/90 to-violet-500/90 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
      >
        {children}
      </Link>
    </motion.div>
  );
}

function GhostBtn({ to, children }) {
  return (
    <motion.div whileTap={{ scale: 0.99 }}>
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/60 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white/80 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
      >
        {children}
      </Link>
    </motion.div>
  );
}

/* ----------------------------- COUNTER ----------------------------- */

function AnimatedNumber({ value, suffix = "" }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const dur = 900;

    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return (
    <span className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

/* ----------------------------- PAGE ----------------------------- */

export default function Home() {
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fadeUp, stagger, hoverLift } = useMotionVariants();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await publicGetCourses();
        const list = res.data?.data || [];
        setTopCourses(list.slice(0, 6));
      } catch {
        setTopCourses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Shell>
      <PublicSeo
        title="Quest Technology - IT, Accounts, Mechanical and Tuition Training"
        description="Join Quest Technology for practical IT, accounts, mechanical, tuition, and exam preparation programs with mentor support and career guidance."
        keywords="Quest Technology, IT training, accounts training, mechanical training, tuition center, JEE NEET coaching, skill development"
        canonicalPath="/"
      />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <NeoCard className="p-7 md:p-10">
              {/* neon glows */}
              <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-12 h-72 w-72 rounded-full bg-violet-400/12 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />

              <Pill>
                <IconSpark className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                Skill Training • Tuition • Career Support
              </Pill>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-[2.85rem] dark:text-white">
                Build practical skills that lead to clear career outcomes.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-white/65">
                Learn through guided projects, mentor support, and structured course plans in IT,
                accounts, mechanical tools, school tuition, and exam preparation tracks.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <PrimaryBtn to="/courses">
                  Explore Courses <IconArrowRight className="h-4 w-4" />
                </PrimaryBtn>
                <GhostBtn to="/enquiry">Start Enquiry</GhostBtn>
              </div>

              <motion.div
                className="mt-7 grid gap-3 sm:grid-cols-3"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
              >
                {assurances.map((item) => (
                  <motion.div key={item} variants={fadeUp}>
                    <div className="rounded-2xl border border-white/12 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <div className="flex items-start gap-2">
                        <IconCheckCircle className="mt-0.5 h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                        <span>{item}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Achievements */}
              <div className="mt-8 rounded-3xl border border-white/12 bg-white/55 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600 dark:text-white/65">
                    Key Achievements
                  </p>
                  <span className="rounded-full bg-gradient-to-r from-cyan-400/15 to-violet-400/15 px-3 py-1 text-[11px] font-bold text-slate-900 dark:text-white/80">
                    Proven Track Record
                  </span>
                </div>

                <motion.div
                  className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                >
                  {keyAchievements.map((item) => (
                    <motion.article
                      key={item.label}
                      variants={fadeUp}
                      className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/70 px-4 py-3 backdrop-blur-xl transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_60%)] opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />
                      <span className="inline-flex rounded-xl border border-white/12 bg-white/60 p-2 dark:border-white/10 dark:bg-white/10">
                        <item.icon className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      </span>
                      <p className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">
                        <AnimatedNumber value={item.value} suffix={item.suffix} />
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-snug text-slate-600 dark:text-white/65">
                        {item.label}
                      </p>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            </NeoCard>
          </motion.div>

          {/* RIGHT: HIGHLIGHTS */}
          <motion.aside variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
            <NeoCard className="p-6 md:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />

              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Quick Highlights
              </h2>

              <motion.div
                className="mt-5 grid gap-3"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
              >
                {highlights.map((item) => (
                  <motion.div key={item.title} variants={fadeUp}>
                    <div className="rounded-2xl border border-white/12 bg-white/60 p-4 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 rounded-xl bg-white/70 p-2 text-cyan-700 dark:bg-white/10 dark:text-cyan-300">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-white/60">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.a
                  whileTap={{ scale: 0.99 }}
                  href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/60 px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <IconPhone className="h-4 w-4" />
                  Call
                </motion.a>

                <motion.a
                  whileTap={{ scale: 0.99 }}
                  href={PUBLIC_CONTACT.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500/90 to-violet-500/90 px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
                >
                  <IconMessageCircle className="h-4 w-4" />
                  WhatsApp
                </motion.a>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl border border-white/12 bg-white/45 p-3 text-xs text-slate-800 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/85">
                <a href={`tel:${PUBLIC_CONTACT.phoneE164}`} className="block font-bold hover:opacity-90">
                  {PUBLIC_CONTACT.phoneDisplay}
                </a>

                {PUBLIC_CONTACT.phoneE164Secondary && (
                  <a href={`tel:${PUBLIC_CONTACT.phoneE164Secondary}`} className="block font-bold hover:opacity-90">
                    {PUBLIC_CONTACT.phoneDisplaySecondary || PUBLIC_CONTACT.phoneE164Secondary}
                  </a>
                )}

                <a href={`mailto:${PUBLIC_CONTACT.email}`} className="block font-semibold hover:opacity-90">
                  {PUBLIC_CONTACT.email}
                </a>

                <p className="text-slate-700 dark:text-white/80">{PUBLIC_CONTACT.location}</p>

                <div className="flex flex-wrap gap-3 pt-1">
                  {PUBLIC_CONTACT.twitter && (
                    <a href={PUBLIC_CONTACT.twitter} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-4 hover:opacity-90">
                      X (Twitter)
                    </a>
                  )}
                  {PUBLIC_CONTACT.instagram && (
                    <a href={PUBLIC_CONTACT.instagram} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-4 hover:opacity-90">
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </NeoCard>
          </motion.aside>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl dark:text-white">Categories</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">Pick the right track for your goal.</p>
          </div>

          <GhostBtn to="/courses">
            View all <IconArrowRight className="h-4 w-4" />
          </GhostBtn>
        </div>

        <motion.div
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {categoryCards.map((item) => (
            <motion.article
              key={item.title}
              variants={fadeUp}
              {...hoverLift}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 p-5 shadow-soft backdrop-blur-2xl transition dark:border-white/10 dark:bg-slate-950/45"
            >
              <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
              <span className="inline-flex rounded-xl bg-white/70 p-2 text-cyan-700 dark:bg-white/10 dark:text-cyan-300">
                <item.icon className="h-5 w-5" />
              </span>

              <h3 className="mt-3 font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-white/60">{item.desc}</p>

              <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />
              <p className="mt-3 text-xs font-bold text-slate-800/80 dark:text-white/70">Tap to explore →</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* BATCH SCHEDULE (Neo Gradient Panel) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(130deg,rgba(6,182,212,0.18)_0%,rgba(15,23,42,0.9)_45%,rgba(139,92,246,0.18)_115%)] p-7 text-white shadow-lift md:p-9"
        >
          <div className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-cyan-400/18 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-2 h-52 w-52 rounded-full bg-violet-400/16 blur-3xl" />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold md:text-3xl">Batch Schedule</h2>
              <p className="mt-1 text-sm text-white/80">Flexible patterns to fit student and professional routines.</p>
            </div>

            <Link
              to="/enquiry"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/15"
            >
              Ask for timings
            </Link>
          </div>

          <motion.div
            className="mt-6 grid gap-4 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {batches.map((batch) => (
              <motion.article
                key={batch.name}
                variants={fadeUp}
                className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">{batch.name}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-extrabold">
                  <IconCalendar className="h-4 w-4 text-cyan-300" />
                  {batch.days}
                </p>
                <p className="mt-2 text-xs text-white/75">{batch.note}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* POPULAR COURSES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl dark:text-white">
              Popular Courses
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
              Latest published courses from the admin panel.
            </p>
          </div>

          <GhostBtn to="/courses">
            Browse all <IconArrowRight className="h-4 w-4" />
          </GhostBtn>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCourseCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {topCourses.map((course, index) => (
              <motion.div key={course._id} variants={fadeUp}>
                <CourseMiniCard course={course} index={index} />
              </motion.div>
            ))}

            {topCourses.length === 0 && (
              <NeoCard className="p-6 text-sm text-slate-600 dark:text-white/60">
                No courses are visible yet. Add and publish courses from the admin panel to display them here.
              </NeoCard>
            )}
          </motion.div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-r from-cyan-500/90 to-violet-500/90 p-8 text-white shadow-lift md:p-10"
        >
          <div className="pointer-events-none absolute -right-14 top-4 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-14 -bottom-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <p className="inline-flex rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
            Admissions Open
          </p>

          <h2 className="mt-4 text-3xl font-extrabold">Ready to join Quest Technology?</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
            Send an enquiry and our team will share the right course path, available batches, and fee plan details.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/enquiry"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:brightness-110"
            >
              Enquiry Now
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
            >
              Browse Courses
            </Link>
          </div>
        </motion.div>
      </section>

      <Testimonials />
      <MouHighlights />
      <FounderVision />
    </Shell>
  );
}

/* ----------------------------- COURSE CARD + SKELETON (Neo Luxury) ----------------------------- */

function CourseMiniCard({ course, index }) {
  const img = getPublicImageUrl(course.imageUrl);

  return (
    <motion.article
      className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl transition dark:border-white/10 dark:bg-slate-950/45"
      style={{ animationDelay: `${index * 70}ms` }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.22, ease: easeOut }}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_60%)] blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-20 -bottom-24 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.18),transparent_60%)] blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative">
        {img ? (
          <img
            src={img}
            alt={course.title}
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-white/60 text-slate-600 dark:bg-white/5 dark:text-white/60">
            <IconBookOpen className="h-7 w-7" />
          </div>
        )}

        {/* shine */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.40),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600 dark:text-white/50">
          {course.categoryId?.name || "Course"}
        </p>

        <h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
          {course.title}
        </h3>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-white/60">
          <p className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
            <span>{course.duration || "Flexible duration"}</span>
          </p>

          <p className="flex items-center gap-2">
            <IconBriefcase className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            <span>From {formatINR(course.installmentStart ?? INSTALLMENT_START)}</span>
          </p>
        </div>

        <Link
          to={`/courses/${course._id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500/90 to-violet-500/90 px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
        >
          View Details
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

function SkeletonCourseCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45">
      <div className="h-44 w-full bg-white/45 dark:bg-white/5" />
      <div className="p-5">
        <div className="h-3 w-28 rounded bg-white/55 dark:bg-white/10" />
        <div className="mt-3 h-5 w-3/4 rounded bg-white/55 dark:bg-white/10" />
        <div className="mt-5 space-y-2">
          <div className="h-4 w-40 rounded bg-white/55 dark:bg-white/10" />
          <div className="h-4 w-52 rounded bg-white/55 dark:bg-white/10" />
        </div>
        <div className="mt-5 h-11 w-full rounded-2xl bg-white/55 dark:bg-white/10" />
      </div>

      {/* shimmer */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.40),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
    </div>
  );
}