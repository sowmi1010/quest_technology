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
  IconShield,
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
  {
    title: "IT",
    desc: "Software and cloud programs for job-ready skills.",
    icon: IconLaptop,
  },
  {
    title: "Mechanical",
    desc: "Design and drafting tool mastery with guided practice.",
    icon: IconWrench,
  },
  {
    title: "Accounts",
    desc: "Finance and business software training with practical use cases.",
    icon: IconCalculator,
  },
  {
    title: "Tuition",
    desc: "Structured subject support for state board students.",
    icon: IconBookOpen,
  },
  {
    title: "JEE / NEET",
    desc: "Concept revision, mock tests, and exam-focused mentoring.",
    icon: IconShield,
  },
];

const batches = [
  {
    name: "Batch A",
    days: "Monday, Wednesday, Friday",
    note: "Ideal for working learners and steady progress.",
  },
  {
    name: "Batch B",
    days: "Tuesday, Thursday, Saturday",
    note: "Balanced schedule for college students.",
  },
  {
    name: "Batch C",
    days: "Weekdays plus Sunday",
    note: "Fast-track option with additional support.",
  },
];

const assurances = [
  "Installment plans from Rs 5,000",
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
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="surface-card animate-fade-up hover-tilt relative overflow-hidden p-7 md:p-10">
            <div className="pointer-events-none absolute -top-14 right-0 h-56 w-56 rounded-full bg-peacock-blue/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-peacock-green/10 blur-3xl" />

            <span className="badge-soft">
              <IconSpark className="h-4 w-4 text-peacock-blue" />
              Skill Training, Tuition, and Career Support
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-peacock-navy md:text-[2.85rem]">
              Build practical skills that lead to clear career outcomes.
            </h1>

            <p className="section-copy mt-4 max-w-2xl">
              Learn through guided projects, mentor support, and structured course plans in IT,
              accounts, mechanical tools, school tuition, and exam preparation tracks.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">
                Explore Courses
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/enquiry" className="btn-secondary">
                Start Enquiry
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {assurances.map((item) => (
                <div
                  key={item}
                  className="surface-soft rounded-2xl px-4 py-3 text-sm font-medium text-peacock-navy"
                >
                  <div className="flex items-start gap-2">
                    <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green" />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              {impactStats.map((item) => (
                <article
                  key={item.label}
                  className="surface-soft rounded-2xl px-4 py-3 text-center transition duration-300 hover:border-peacock-blue/40"
                >
                  <p className="text-lg font-extrabold text-peacock-navy">{item.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-peacock-muted">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="surface-card animate-fade-up-delay-1 relative overflow-hidden p-6 md:p-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-peacock-blue/15 blur-2xl" />
            <h2 className="text-xl font-bold text-peacock-navy">Quick Highlights</h2>

            <div className="mt-5 grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="surface-soft hover-tilt rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 rounded-xl bg-peacock-bg p-2 text-peacock-blue">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-peacock-navy">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-peacock-muted">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a href={`tel:${PUBLIC_CONTACT.phoneE164}`} className="btn-secondary !px-3">
                <IconPhone className="h-4 w-4" />
                Call
              </a>
              <a
                href={PUBLIC_CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="btn-primary !bg-none !bg-peacock-green !px-3"
              >
                <IconMessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-peacock-navy md:text-3xl">Categories</h2>
            <p className="mt-1 text-sm text-peacock-muted">Pick the right track for your goal.</p>
          </div>
          <Link to="/courses" className="btn-secondary !px-4 !py-2">
            View all
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categoryCards.map((item, index) => (
            <article
              key={item.title}
              className="surface-card hover-tilt animate-fade-up group p-5"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="inline-flex rounded-xl bg-peacock-bg p-2 text-peacock-blue">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-peacock-navy">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-peacock-muted">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="animate-fade-up-delay-1 relative overflow-hidden rounded-3xl border border-peacock-border/40 bg-[linear-gradient(130deg,#0f223f_0%,#173563_55%,#0a6d69_115%)] p-7 text-white shadow-lift md:p-9">
          <div className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-2 h-52 w-52 rounded-full bg-peacock-green/30 blur-3xl" />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Batch Schedule</h2>
              <p className="mt-1 text-sm text-white/80">
                Flexible timing patterns to fit student and professional routines.
              </p>
            </div>
            <Link to="/enquiry" className="btn-secondary !border-white/30 !bg-white/10 !text-white">
              Ask for timings
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {batches.map((batch) => (
              <article
                key={batch.name}
                className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/15"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">{batch.name}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <IconCalendar className="h-4 w-4 text-peacock-green" />
                  {batch.days}
                </p>
                <p className="mt-2 text-xs text-white/75">{batch.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-peacock-navy md:text-3xl">Popular Courses</h2>
            <p className="mt-1 text-sm text-peacock-muted">Latest published courses from the admin panel.</p>
          </div>
          <Link to="/courses" className="btn-secondary !px-4 !py-2">
            Browse all
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="surface-soft mt-6 rounded-2xl p-6 text-sm text-peacock-muted">
            Loading courses...
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topCourses.map((course, index) => (
              <CourseMiniCard key={course._id} course={course} index={index} />
            ))}

            {topCourses.length === 0 && (
              <div className="surface-card p-6 text-sm text-peacock-muted">
                No courses are visible yet. Add and publish courses from the admin panel to display
                them here.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        <div className="animate-fade-up-delay-2 relative overflow-hidden rounded-3xl border border-peacock-border/45 bg-gradient-to-r from-peacock-blue to-peacock-green p-8 text-white shadow-lift md:p-10">
          <div className="pointer-events-none absolute -right-14 top-4 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-14 -bottom-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <p className="badge-soft !border-white/30 !bg-white/20 !text-white">Admissions Open</p>
          <h2 className="mt-4 text-3xl font-bold">Ready to join Quest Technology?</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
            Send an enquiry and our team will share the right course path, available batches, and fee
            plan details.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/enquiry" className="btn-secondary !border-white/40 !bg-white !text-peacock-navy">
              Enquiry Now
            </Link>
            <Link to="/courses" className="btn-secondary !border-white/35 !bg-white/10 !text-white">
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
      className="surface-card hover-tilt animate-fade-up group overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {img ? (
        <img src={img} alt={course.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-peacock-bg text-peacock-muted">
          <IconBookOpen className="h-7 w-7" />
        </div>
      )}

      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-peacock-muted">
          {course.categoryId?.name || "Course"}
        </p>

        <h3 className="mt-2 text-lg font-bold text-peacock-navy">{course.title}</h3>

        <div className="mt-3 space-y-2 text-sm text-peacock-muted">
          <p className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-peacock-blue" />
            <span>{course.duration || "Flexible duration"}</span>
          </p>
          <p className="flex items-center gap-2">
            <IconBriefcase className="h-4 w-4 text-peacock-green" />
            <span>From {formatINR(course.installmentStart ?? INSTALLMENT_START)}</span>
          </p>
        </div>

        <Link to={`/courses/${course._id}`} className="btn-primary mt-4 w-full !justify-center">
          View Details
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
