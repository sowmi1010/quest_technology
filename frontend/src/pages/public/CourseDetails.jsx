import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="surface-card p-6 text-sm text-peacock-muted">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="surface-card p-6 text-sm text-peacock-muted">Course not found.</div>
      </div>
    );
  }

  const img = getPublicImageUrl(course.imageUrl);
  const syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up mb-5">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-peacock-blue transition hover:text-peacock-navy"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
          Back to courses
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_0.95fr]">
        <div className="surface-card animate-fade-up overflow-hidden">
          {img ? (
            <img src={img} alt={course.title} className="h-72 w-full object-cover" />
          ) : (
            <div className="flex h-72 items-center justify-center bg-peacock-bg text-peacock-muted">
              <IconBookOpen className="h-8 w-8" />
            </div>
          )}

          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-peacock-muted">
              {course.categoryId?.name || "Category"}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-peacock-navy md:text-4xl">
              {course.title}
            </h1>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoBox
                icon={<IconClock className="h-4 w-4 text-peacock-blue" />}
                label="Duration"
                value={course.duration || "Flexible"}
              />
              <InfoBox
                icon={<IconBriefcase className="h-4 w-4 text-peacock-blue" />}
                label="Total Fee"
                value={formatINR(course.totalFee)}
              />
              <InfoBox
                icon={<IconCalendar className="h-4 w-4 text-peacock-blue" />}
                label="Installment Start"
                value={formatINR(course.installmentStart ?? INSTALLMENT_START)}
              />
              <InfoBox
                icon={<IconShield className="h-4 w-4 text-peacock-blue" />}
                label="Visibility"
                value={course.isPublic ? "Public" : "Private"}
              />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-peacock-navy">Syllabus Outline</h2>

              {syllabus.length ? (
                <ul className="mt-3 grid gap-2">
                  {syllabus.map((item, idx) => (
                    <li
                      key={`${item}-${idx}`}
                      className="flex items-start gap-2 rounded-xl border border-peacock-border bg-peacock-bg/70 px-3 py-2 text-sm text-peacock-ink"
                    >
                      <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-xl border border-peacock-border bg-peacock-bg/70 px-3 py-2 text-sm text-peacock-muted">
                  No syllabus added yet.
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/enquiry"
                className="btn-primary !bg-none !bg-peacock-green"
              >
                Enquiry Now
              </Link>

              <Link
                to="/courses"
                className="btn-secondary"
              >
                Back to Courses
              </Link>
            </div>
          </div>
        </div>

        <aside className="animate-fade-up-delay-1 space-y-5">
          <div className="surface-card sticky top-24 p-6">
            <h2 className="text-lg font-bold text-peacock-navy">Need guidance?</h2>
            <p className="mt-2 text-sm leading-relaxed text-peacock-muted">
              Contact our team for batch timings, fee plans, and admission support.
            </p>

            <div className="mt-4 grid gap-3">
              <a href={`tel:${PUBLIC_CONTACT.phoneE164}`} className="btn-secondary !justify-center">
                <IconPhone className="h-4 w-4" />
                Call {PUBLIC_CONTACT.phoneDisplay}
              </a>

              <a
                href={PUBLIC_CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="btn-primary !justify-center !bg-none !bg-peacock-green"
              >
                <IconMessageCircle className="h-4 w-4" />
                Start WhatsApp Chat
              </a>
            </div>

            <p className="mt-4 text-xs text-peacock-muted">
              Installment plans start from{" "}
              <span className="font-semibold text-peacock-blue">{formatINR(INSTALLMENT_START)}</span>.
            </p>
          </div>

          <div className="surface-card p-5">
            <h3 className="font-semibold text-peacock-navy">What you get</h3>
            <ul className="mt-3 space-y-2 text-sm text-peacock-muted">
              <li className="flex items-center gap-2">
                <IconCheckCircle className="h-4 w-4 text-peacock-green" />
                Structured modules with practical sessions
              </li>
              <li className="flex items-center gap-2">
                <IconCheckCircle className="h-4 w-4 text-peacock-green" />
                Mentor support and regular progress checks
              </li>
              <li className="flex items-center gap-2">
                <IconCheckCircle className="h-4 w-4 text-peacock-green" />
                Career and interview guidance
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-peacock-border bg-peacock-bg/75 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-peacock-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-peacock-navy">{value}</div>
    </div>
  );
}
