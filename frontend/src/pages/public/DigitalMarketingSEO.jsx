import { Link } from "react-router-dom";
import {
  IconArrowRight,
  IconBookOpen,
  IconBriefcase,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconGraduationCap,
  IconLaptop,
  IconSearch,
  IconSpark,
  IconUsers,
} from "../../components/ui/PublicIcons";
import PublicSeo from "../../components/seo/PublicSeo";

const quickStats = [
  { label: "Program Duration", value: "4-6 Months", icon: IconClock },
  { label: "Live Projects", value: "8+", icon: IconLaptop },
  { label: "Core Modules", value: "12", icon: IconBookOpen },
  { label: "Career Support", value: "Interview + Portfolio", icon: IconBriefcase },
];

const syllabusModules = [
  {
    title: "Digital Marketing Foundation",
    points: [
      "Marketing funnel and customer journey",
      "Brand positioning and audience research",
      "Competitor mapping and planning",
    ],
  },
  {
    title: "SEO Mastery",
    points: [
      "Keyword research and search intent",
      "On-page and technical SEO",
      "Backlinks, local SEO, and ranking strategy",
    ],
  },
  {
    title: "Content and Social Growth",
    points: [
      "Content planning and copywriting basics",
      "Instagram, Facebook, and LinkedIn growth",
      "Canva creatives and calendar execution",
    ],
  },
  {
    title: "Google Ads and Meta Ads",
    points: [
      "Search, display, and remarketing campaigns",
      "Meta campaign setup and optimization",
      "Budgeting, ROAS, and scaling ads",
    ],
  },
  {
    title: "Analytics and Reporting",
    points: [
      "GA4 setup, events, and conversion tracking",
      "Search Console and performance dashboards",
      "Client reports and growth presentation",
    ],
  },
  {
    title: "Career and Freelance Track",
    points: [
      "Resume, portfolio, and case study building",
      "Mock interview and client pitch practice",
      "Freelance proposal and pricing workflow",
    ],
  },
];

const toolsCovered = [
  "Google Search Console",
  "Google Analytics (GA4)",
  "Google Ads",
  "Meta Ads Manager",
  "SEMrush / Ahrefs (concept level)",
  "Canva",
  "WordPress",
  "Google Tag Manager",
  "Looker Studio",
];

const careerRoles = [
  "SEO Executive",
  "Digital Marketing Executive",
  "Performance Marketing Associate",
  "Social Media Strategist",
  "Freelance Digital Marketer",
];

const faqs = [
  {
    q: "Is this course for beginners?",
    a: "Yes. The program starts from fundamentals and then moves to advanced SEO and paid ads.",
  },
  {
    q: "Will I work on real projects?",
    a: "Yes. You will complete practical assignments and case studies to build a job-ready portfolio.",
  },
  {
    q: "Do I get support for jobs?",
    a: "Yes. You get resume support, mock interviews, and guidance for placement opportunities.",
  },
  {
    q: "Can I join if I am a student or working professional?",
    a: "Yes. We provide flexible batch options that suit both college students and working learners.",
  },
];

export default function DigitalMarketingSEO() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PublicSeo
        title="Digital Marketing and SEO Course"
        description="Master SEO, Google Ads, Meta Ads, content strategy, and analytics with practical projects in our Digital Marketing course."
        keywords="digital marketing course, SEO training, Google Ads, Meta Ads, GA4, Quest Technology"
        canonicalPath="/digital-marketing-seo"
      />

      <section className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl md:p-9 dark:border-white/10 dark:bg-slate-950/35">
        <div className="pointer-events-none absolute -top-20 left-10 h-72 w-72 rounded-full bg-peacock-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-peacock-green/12 blur-3xl" />

        <p className="inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          <IconSearch className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
          Digital Marketing + SEO Program
        </p>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-peacock-navy md:text-5xl dark:text-white">
              Complete Digital Marketing Course with Advanced SEO Training
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/65">
              Learn SEO, paid ads, content strategy, analytics, and campaign execution with practical
              projects. Build a portfolio that helps you get hired or start freelancing confidently.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
              >
                Enquire for This Program
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-2xl border border-peacock-border/70 bg-white/60 px-5 py-3 text-sm font-extrabold text-peacock-navy transition hover:bg-white/85 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                View All Courses
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-peacock-navy dark:text-white">Who Should Join</h2>
            <ul className="mt-4 space-y-3 text-sm text-peacock-muted dark:text-white/65">
              <li className="flex items-start gap-2">
                <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green dark:text-emerald-200" />
                Students planning a career in digital marketing
              </li>
              <li className="flex items-start gap-2">
                <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green dark:text-emerald-200" />
                Business owners who want lead generation through SEO and ads
              </li>
              <li className="flex items-start gap-2">
                <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green dark:text-emerald-200" />
                Job seekers and freelancers looking for practical execution skills
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat, i) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-peacock-border/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:border-peacock-blue/40 animate-fade-up dark:border-white/10 dark:bg-slate-950/35"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="inline-flex rounded-xl bg-peacock-bg p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-peacock-muted dark:text-white/50">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-extrabold text-peacock-navy dark:text-white">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              <IconSpark className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
              Complete Syllabus
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-peacock-navy md:text-3xl dark:text-white">
              What You Will Learn
            </h2>
          </div>
          <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-peacock-navy dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            Beginner to Advanced
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {syllabusModules.map((module, idx) => (
            <article
              key={module.title}
              className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/55 p-4 transition hover:-translate-y-1 hover:border-peacock-blue/40 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-xs font-extrabold text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-peacock-navy dark:text-white">{module.title}</h3>
                  <ul className="mt-2 space-y-2">
                    {module.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-peacock-muted dark:text-white/65">
                        <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green dark:text-emerald-200" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35">
          <h2 className="text-2xl font-extrabold text-peacock-navy dark:text-white">Tools Covered</h2>
          <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">
            Hands-on practice with industry tools used by agencies and product companies.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {toolsCovered.map((tool) => (
              <div
                key={tool}
                className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/55 px-4 py-3 text-sm font-semibold text-peacock-navy dark:border-white/10 dark:bg-white/5 dark:text-white/80"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35">
          <h2 className="text-2xl font-extrabold text-peacock-navy dark:text-white">Career Outcomes</h2>
          <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">
            Roles you can apply for after course completion.
          </p>
          <div className="mt-5 space-y-3">
            {careerRoles.map((role) => (
              <div
                key={role}
                className="flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/55 px-4 py-3 text-sm font-semibold text-peacock-navy dark:border-white/10 dark:bg-white/5 dark:text-white/80"
              >
                <IconUsers className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
                {role}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-peacock-border/60 bg-gradient-to-r from-peacock-blue/10 to-peacock-green/10 p-4 dark:border-white/10 dark:from-peacock-blue/15 dark:to-peacock-green/15">
            <p className="text-sm font-extrabold text-peacock-navy dark:text-white">Portfolio + Interview Prep Included</p>
            <p className="mt-1 text-xs text-peacock-muted dark:text-white/65">
              Resume support, profile optimization, and mock interview practice.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-peacock-border/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 md:p-8">
        <h2 className="text-2xl font-extrabold text-peacock-navy md:text-3xl dark:text-white">Frequently Asked Questions</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <article
              key={item.q}
              className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/55 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-2">
                <IconGraduationCap className="mt-0.5 h-4 w-4 text-peacock-blue dark:text-sky-200" />
                <div>
                  <h3 className="font-extrabold text-peacock-navy dark:text-white">{item.q}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-peacock-muted dark:text-white/65">{item.a}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="relative overflow-hidden rounded-3xl border border-peacock-border/45 bg-gradient-to-r from-peacock-blue to-peacock-green p-7 text-white shadow-lift md:p-10">
          <div className="pointer-events-none absolute -right-14 top-4 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-14 -bottom-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <p className="inline-flex rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
            Admissions Open
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">Ready to start Digital Marketing + SEO?</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
            Connect with our team for batch timings, fee plan, and personalized learning path.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/enquiry"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-peacock-navy transition hover:brightness-110"
            >
              Enquiry Now
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
            >
              Compare Courses
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
