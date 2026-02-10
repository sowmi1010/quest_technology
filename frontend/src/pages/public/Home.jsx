import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  IconWrench,
} from "../../components/ui/PublicIcons";
import {
  INSTALLMENT_START,
  PUBLIC_CONTACT,
  formatINR,
  getPublicImageUrl,
} from "../../utils/publicUi";
import Testimonials from "./components/Testimonials";

const highlights = [
  {
    title: "IT Programs",
    text: "Full Stack, AWS, and Digital Marketing with project-first training.",
    icon: IconLaptop,
  },
  {
    title: "Accounts Programs",
    text: "Tally, SAP, and MS Office modules aligned with real office workflows.",
    icon: IconCalculator,
  },
  {
    title: "Mechanical Tools",
    text: "Hands-on Creo, SolidWorks, and AutoCAD sessions.",
    icon: IconWrench,
  },
  {
    title: "Tuition + Exam Track",
    text: "School tuition for grades 6 to 12 with JEE and NEET support.",
    icon: IconGraduationCap,
  },
];

const categoryCards = [
  { title: "IT", desc: "Software and cloud programs for job-ready skills.", icon: IconLaptop },
  { title: "Mechanical", desc: "Design and drafting tool mastery with guided practice.", icon: IconWrench },
  { title: "Accounts", desc: "Finance and business software training with practical use cases.", icon: IconCalculator },
  { title: "Tuition", desc: "Structured subject support for state board students.", icon: IconBookOpen },
  { title: "JEE / NEET", desc: "Concept revision, mock tests, and exam-focused mentoring.", icon: IconGraduationCap },
];

const batches = [
  { name: "Batch A", days: "Monday, Wednesday, Friday", note: "Ideal for working learners and steady progress." },
  { name: "Batch B", days: "Tuesday, Thursday, Saturday", note: "Balanced schedule for college students." },
  { name: "Batch C", days: "Weekdays plus Sunday", note: "Fast-track option with additional support." },
];

const assurances = [
  "Installment plans from ₹5,000",
  "Three batch patterns with flexible timing",
  "Placement and interview guidance",
];

const impactStats = [
  { value: "2500+", label: "Students Trained" },
  { value: "35+", label: "Industry Modules" },
  { value: "1200+", label: "Career Placements" },
  { value: "4.8/5", label: "Learner Satisfaction" },
];

export default function Home() {
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="pb-10">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-7 shadow-soft backdrop-blur-xl animate-fade-up hover-tilt md:p-10 dark:border-white/10 dark:bg-slate-950/35">
            {/* Premium glows */}
            <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-peacock-blue/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-peacock-green/15 blur-3xl" />

            <span className="inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              <IconSpark className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
              Skill Training • Tuition • Career Support
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-peacock-navy md:text-[2.85rem] dark:text-white">
              Build practical skills that lead to clear career outcomes.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/60">
              Learn through guided projects, mentor support, and structured course plans in IT,
              accounts, mechanical tools, school tuition, and exam preparation tracks.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
              >
                Explore Courses
                <IconArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/enquiry"
                className="inline-flex items-center justify-center rounded-2xl border border-peacock-border/60 bg-white/60 px-5 py-3 text-sm font-extrabold text-peacock-navy transition hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Start Enquiry
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {assurances.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-4 py-3 text-sm font-semibold text-peacock-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <div className="flex items-start gap-2">
                    <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green dark:text-emerald-200" />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              {impactStats.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-peacock-border/60 bg-white/50 px-4 py-3 text-center transition hover:-translate-y-0.5 hover:border-peacock-blue/40 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-lg font-extrabold text-peacock-navy dark:text-white">{item.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-peacock-muted dark:text-white/60">
                    {item.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT: HIGHLIGHTS */}
          <aside className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl animate-fade-up-delay-1 md:p-7 dark:border-white/10 dark:bg-slate-950/35">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-peacock-blue/15 blur-2xl" />

            <h2 className="text-xl font-extrabold text-peacock-navy dark:text-white">Quick Highlights</h2>

            <div className="mt-5 grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 p-4 transition hover:-translate-y-0.5 hover:border-peacock-blue/40 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 rounded-xl bg-white/60 p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-peacock-navy dark:text-white">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-peacock-muted dark:text-white/60">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-peacock-border/60 bg-white/60 px-4 py-3 text-sm font-extrabold text-peacock-navy transition hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <IconPhone className="h-4 w-4" />
                Call
              </a>

              <a
                href={PUBLIC_CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-green to-peacock-blue px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
              >
                <IconMessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-peacock-navy md:text-3xl dark:text-white">Categories</h2>
            <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">Pick the right track for your goal.</p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-white/60 px-4 py-2 text-sm font-extrabold text-peacock-navy transition hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            View all
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categoryCards.map((item, index) => (
            <article
              key={item.title}
              className="rounded-3xl border border-peacock-border/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:border-peacock-blue/40 animate-fade-up dark:border-white/10 dark:bg-slate-950/35"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="inline-flex rounded-xl bg-peacock-bg p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-extrabold text-peacock-navy dark:text-white">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-peacock-muted dark:text-white/60">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* BATCH SCHEDULE (already premium) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-peacock-border/40 bg-[linear-gradient(130deg,#0f223f_0%,#173563_55%,#0a6d69_115%)] p-7 text-white shadow-lift md:p-9 animate-fade-up-delay-1">
          <div className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-2 h-52 w-52 rounded-full bg-peacock-green/30 blur-3xl" />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold md:text-3xl">Batch Schedule</h2>
              <p className="mt-1 text-sm text-white/80">
                Flexible timing patterns to fit student and professional routines.
              </p>
            </div>

            <Link
              to="/enquiry"
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/15"
            >
              Ask for timings
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {batches.map((batch) => (
              <article
                key={batch.name}
                className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">{batch.name}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-extrabold">
                  <IconCalendar className="h-4 w-4 text-peacock-green" />
                  {batch.days}
                </p>
                <p className="mt-2 text-xs text-white/75">{batch.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-peacock-navy md:text-3xl dark:text-white">
              Popular Courses
            </h2>
            <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">
              Latest published courses from the admin panel.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-white/60 px-4 py-2 text-sm font-extrabold text-peacock-navy transition hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Browse all
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-peacock-border/60 bg-peacock-bg/50 p-6 text-sm text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
            Loading courses...
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topCourses.map((course, index) => (
              <CourseMiniCard key={course._id} course={course} index={index} />
            ))}

            {topCourses.length === 0 && (
              <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 text-sm text-peacock-muted shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 dark:text-white/60">
                No courses are visible yet. Add and publish courses from the admin panel to display them here.
              </div>
            )}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-peacock-border/45 bg-gradient-to-r from-peacock-blue to-peacock-green p-8 text-white shadow-lift md:p-10 animate-fade-up-delay-2">
          <div className="pointer-events-none absolute -right-14 top-4 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-14 -bottom-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <p className="inline-flex rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
            Admissions Open
          </p>

          <h2 className="mt-4 text-3xl font-extrabold">Ready to join Quest Technology?</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
            Send an enquiry and our team will share the right course path, available batches, and fee plan details.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/enquiry" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-peacock-navy transition hover:brightness-110">
              Enquiry Now
            </Link>
            <Link to="/courses" className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />
    </div>
  );
}

function CourseMiniCard({ course, index }) {
  const img = getPublicImageUrl(course.imageUrl);

  return (
    <article
      className="overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:border-peacock-blue/40 animate-fade-up dark:border-white/10 dark:bg-slate-950/35"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {img ? (
        <img src={img} alt={course.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-peacock-bg text-peacock-muted dark:bg-white/5 dark:text-white/60">
          <IconBookOpen className="h-7 w-7" />
        </div>
      )}

      <div className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-peacock-muted dark:text-white/50">
          {course.categoryId?.name || "Course"}
        </p>

        <h3 className="mt-2 text-lg font-extrabold text-peacock-navy dark:text-white">{course.title}</h3>

        <div className="mt-3 space-y-2 text-sm text-peacock-muted dark:text-white/60">
          <p className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
            <span>{course.duration || "Flexible duration"}</span>
          </p>

          <p className="flex items-center gap-2">
            <IconBriefcase className="h-4 w-4 text-peacock-green dark:text-emerald-200" />
            <span>From {formatINR(course.installmentStart ?? INSTALLMENT_START)}</span>
          </p>
        </div>

        <Link
          to={`/courses/${course._id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
        >
          View Details
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
