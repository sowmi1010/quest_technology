import { useMemo, useState } from "react";
import { submitEnquiry } from "../../services/enquiryApi";
import {
  IconArrowRight,
  IconCalendar,
  IconCheckCircle,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
} from "../../components/ui/PublicIcons";
import { PUBLIC_CONTACT } from "../../utils/publicUi";

const initialForm = {
  name: "",
  phone: "",
  category: "IT",
  course: "",
  preferredBatch: "Mon/Wed/Fri",
  message: "",
};

const categories = ["IT", "Mechanical", "Accounts", "School Tuition", "JEE/NEET"];
const batchOptions = ["Mon/Wed/Fri", "Tue/Thu/Sat", "Weekdays + Sunday"];

function onlyDigits(str) {
  return String(str || "").replace(/\D/g, "");
}

export default function Enquiry() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const phoneDigits = useMemo(() => onlyDigits(form.phone), [form.phone]);
  const phoneValid = phoneDigits.length === 10;

  const onChange = (e) => {
    const { name, value } = e.target;

    // phone nice input
    if (name === "phone") {
      const digits = onlyDigits(value).slice(0, 10);
      setForm((p) => ({ ...p, phone: digits }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!phoneValid) {
      setStatus({ type: "error", message: "Please enter a valid 10-digit phone number." });
      return;
    }

    setLoading(true);
    try {
      await submitEnquiry({ ...form, phone: phoneDigits });

      setStatus({
        type: "success",
        message: "Enquiry submitted successfully. Our team will contact you soon.",
      });

      setForm(initialForm);
    } catch {
      setStatus({ type: "error", message: "Submission failed. Please try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  const statusStyles =
    status.type === "success"
      ? "border-peacock-green/30 bg-peacock-green/10 text-peacock-green dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200"
      : "border-red-300 bg-red-50 text-red-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-200";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Top header */}
      <div className="mb-6">
        <p className="inline-flex items-center rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          Admissions
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-peacock-navy md:text-4xl dark:text-white">
          Enquiry & Admission Support
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/60">
          Share your details and we’ll help you choose the right course, batch timings, and fee plan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
        {/* LEFT CARD */}
        <aside className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-7 shadow-soft backdrop-blur-xl dark:bg-slate-950/35 dark:border-white/10">
          {/* Premium glows */}
          <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-peacock-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-peacock-green/15 blur-3xl" />

          <p className="badge-soft">Admissions Desk</p>

          <h2 className="mt-4 text-2xl font-extrabold text-peacock-navy dark:text-white">
            Tell us what you want to learn
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-peacock-muted dark:text-white/60">
            Submit your details and we will guide you with course selection, fees, and admissions.
          </p>

          {/* Contact buttons */}
          <div className="mt-6 grid gap-3 text-sm">
            <a
              href={`tel:${PUBLIC_CONTACT.phoneE164}`}
              className="group flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-4 py-3 font-semibold text-peacock-navy transition
                         hover:-translate-y-0.5 hover:border-peacock-blue/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <span className="rounded-xl bg-white/70 p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                <IconPhone className="h-4 w-4" />
              </span>
              <span>{PUBLIC_CONTACT.phoneDisplay}</span>
            </a>

            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="group flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-4 py-3 font-semibold text-peacock-navy transition
                         hover:-translate-y-0.5 hover:border-peacock-blue/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <span className="rounded-xl bg-white/70 p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                <IconMail className="h-4 w-4" />
              </span>
              <span>{PUBLIC_CONTACT.email}</span>
            </a>

            <a
              href={PUBLIC_CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-4 py-3 font-semibold text-peacock-navy transition
                         hover:-translate-y-0.5 hover:border-peacock-blue/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <span className="rounded-xl bg-white/70 p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                <IconMessageCircle className="h-4 w-4" />
              </span>
              <span>WhatsApp Support</span>
            </a>

            <div className="flex items-start gap-2 rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 px-4 py-3 text-peacock-navy dark:border-white/10 dark:bg-white/5 dark:text-white">
              <span className="mt-0.5 rounded-xl bg-white/70 p-2 text-peacock-blue dark:bg-white/10 dark:text-sky-200">
                <IconMapPin className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold leading-relaxed">{PUBLIC_CONTACT.location}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-7 space-y-3 text-sm text-peacock-ink dark:text-white/70">
            <Benefit icon={<IconCheckCircle className="h-4 w-4" />} title="Counselor guidance" desc="Help choosing the best course for your goal." />
            <Benefit icon={<IconCalendar className="h-4 w-4" />} title="Flexible batches" desc="Options for students & working professionals." />
            <Benefit icon={<IconMessageCircle className="h-4 w-4" />} title="Fast response" desc="Quick callback + WhatsApp support." />
          </div>
        </aside>

        {/* RIGHT FORM */}
        <form
          onSubmit={onSubmit}
          className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 p-7 shadow-soft backdrop-blur-xl md:p-8 dark:bg-slate-950/35 dark:border-white/10"
        >
          {/* subtle glow */}
          <div className="pointer-events-none absolute -top-20 right-10 h-56 w-56 rounded-full bg-peacock-blue/10 blur-3xl" />

          <h2 className="text-2xl font-extrabold text-peacock-navy dark:text-white">
            Enquiry Form
          </h2>
          <p className="mt-1 text-sm text-peacock-muted dark:text-white/60">
            Fill your details to get a personalized callback.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <input
                className="input-control"
                placeholder="Your name"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </Field>

            <Field label="Phone Number" hint="10-digit number">
              <input
                className={`input-control ${form.phone && !phoneValid ? "!border-red-300 !ring-red-200/40" : ""}`}
                placeholder="9876543210"
                name="phone"
                value={form.phone}
                onChange={onChange}
                inputMode="numeric"
                required
              />
              {form.phone && !phoneValid && (
                <p className="mt-1 text-xs font-semibold text-red-600 dark:text-rose-200">
                  Enter valid 10 digits.
                </p>
              )}
            </Field>

            <Field label="Category">
              <select
                className="select-control"
                name="category"
                value={form.category}
                onChange={onChange}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>

            <Field label="Preferred Batch">
              <select
                className="select-control"
                name="preferredBatch"
                value={form.preferredBatch}
                onChange={onChange}
              >
                {batchOptions.map((batch) => (
                  <option key={batch}>{batch}</option>
                ))}
              </select>
            </Field>

            <Field label="Course Name" className="md:col-span-2">
              <input
                className="input-control"
                placeholder="Example: Full Stack, Tally, SAP"
                name="course"
                value={form.course}
                onChange={onChange}
                required
              />
            </Field>

            <Field label="Message (Optional)" className="md:col-span-2">
              <textarea
                className="input-control min-h-28 resize-y"
                placeholder="Share your goals or preferred timing"
                name="message"
                value={form.message}
                onChange={onChange}
                rows={4}
              />
            </Field>
          </div>

          <button
            disabled={loading || !phoneValid}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white
                       transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Enquiry"}
            {!loading && <IconArrowRight className="h-4 w-4" />}
          </button>

          {status.message && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${statusStyles}`}>
              {status.message}
            </div>
          )}

          <p className="mt-4 text-xs text-peacock-muted dark:text-white/50">
            By submitting, you agree to be contacted by phone/WhatsApp for admission guidance.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-peacock-navy dark:text-white">{label}</span>
        {hint && <span className="text-xs font-semibold text-peacock-muted dark:text-white/50">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Benefit({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-peacock-border/60 bg-peacock-bg/50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mt-0.5 rounded-xl bg-white/70 p-2 text-peacock-green dark:bg-white/10 dark:text-emerald-200">
        {icon}
      </div>
      <div>
        <div className="font-extrabold text-peacock-navy dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-peacock-muted dark:text-white/60">{desc}</div>
      </div>
    </div>
  );
}
