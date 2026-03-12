import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { submitEnquiry } from "../../services/enquiryApi";
import {
  IconArrowRight,
  IconCalendar,
  IconCheckCircle,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconSpark,
} from "../../components/ui/PublicIcons";
import { PUBLIC_CONTACT } from "../../utils/publicUi";
import PublicSeo from "../../components/seo/PublicSeo";

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

const ease = [0.16, 1, 0.3, 1];

function useMotionPresets() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  return { reduce, fadeUp, stagger };
}

/* ----------------------------- Neo Primitives ----------------------------- */

function NeoCard({ className = "", children }) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl " +
        "dark:bg-slate-950/45 dark:border-white/10 " +
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-500 " +
        "before:bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.16),transparent_55%)] " +
        "group-hover:before:opacity-100 " +
        className
      }
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      <div className="relative">{children}</div>
    </div>
  );
}

// fallback if your global classes don't exist
const inputBase =
  "w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 " +
  "shadow-[0_8px_30px_rgba(0,0,0,0.05)] outline-none transition " +
  "focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-300/35 " +
  "dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:border-white/10 dark:focus:ring-cyan-400/25";

const selectBase =
  "w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition " +
  "focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-300/35 " +
  "dark:bg-white/5 dark:text-white dark:border-white/10 dark:focus:ring-cyan-400/25";

/* ----------------------------- Page ----------------------------- */

export default function Enquiry() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const { fadeUp, stagger } = useMotionPresets();

  const phoneDigits = useMemo(() => onlyDigits(form.phone), [form.phone]);
  const phoneValid = phoneDigits.length === 10;

  const onChange = (e) => {
    const { name, value } = e.target;

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
      ? "border-emerald-300/25 bg-emerald-500/10 text-emerald-200"
      : "border-rose-300/25 bg-rose-500/10 text-rose-200";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 overflow-x-hidden">
      <PublicSeo
        title="Enquiry and Admission Support"
        description="Contact Quest Technology admissions for course counselling, batch timings, fee plans, and enrollment support."
        keywords="Quest Technology enquiry, admission support, course counselling, training institute contact"
        canonicalPath="/enquiry"
      />

      {/* Neo mesh background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.11),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          <IconSpark className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
          Admissions
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl dark:text-white">
          Enquiry & Admission Support
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-white/60">
          Share your details and we’ll help you choose the right course, batch timings, and fee plan.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
        {/* LEFT */}
        <motion.aside variants={fadeUp} initial="hidden" animate="show">
          <NeoCard className="p-7">
            <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-400/12 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-25" />

            <p className="inline-flex w-fit rounded-full border border-white/15 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              Admissions Desk
            </p>

            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
              Tell us what you want to learn
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/60">
              Submit your details and we will guide you with course selection, fees, and admissions.
            </p>

            {/* Contact buttons */}
            <div className="mt-6 grid gap-3 text-sm">
              <NeoContact
                href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                icon={<IconPhone className="h-4 w-4" />}
                text={PUBLIC_CONTACT.phoneDisplay}
              />
              <NeoContact
                href={`mailto:${PUBLIC_CONTACT.email}`}
                icon={<IconMail className="h-4 w-4" />}
                text={PUBLIC_CONTACT.email}
              />
              <NeoContact
                href={PUBLIC_CONTACT.whatsapp}
                icon={<IconMessageCircle className="h-4 w-4" />}
                text="WhatsApp Support"
                external
              />

              <div className="flex items-start gap-2 rounded-2xl border border-white/12 bg-white/60 px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <span className="mt-0.5 rounded-xl bg-white/70 p-2 text-cyan-700 dark:bg-white/10 dark:text-cyan-300">
                  <IconMapPin className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold leading-relaxed text-slate-800 dark:text-white/85">
                  {PUBLIC_CONTACT.location}
                </span>
              </div>
            </div>

            {/* Benefits */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="mt-7 space-y-3">
              <motion.div variants={fadeUp}>
                <Benefit
                  icon={<IconCheckCircle className="h-4 w-4" />}
                  title="Counselor guidance"
                  desc="Help choosing the best course for your goal."
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <Benefit
                  icon={<IconCalendar className="h-4 w-4" />}
                  title="Flexible batches"
                  desc="Options for students & working professionals."
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <Benefit
                  icon={<IconMessageCircle className="h-4 w-4" />}
                  title="Fast response"
                  desc="Quick callback + WhatsApp support."
                />
              </motion.div>
            </motion.div>
          </NeoCard>
        </motion.aside>

        {/* RIGHT FORM */}
        <motion.form variants={fadeUp} initial="hidden" animate="show" onSubmit={onSubmit}>
          <NeoCard className="p-7 md:p-8">
            <div className="pointer-events-none absolute -top-24 right-6 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-6 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Enquiry Form</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
              Fill your details to get a personalized callback.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <input
                  className={`input-control ${inputBase}`}
                  placeholder="Your name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </Field>

              <Field label="Phone Number" hint="10-digit number">
                <input
                  className={[
                    `input-control ${inputBase}`,
                    form.phone && !phoneValid ? "!border-rose-300/60 !ring-2 !ring-rose-300/25" : "",
                  ].join(" ")}
                  placeholder="9876543210"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  inputMode="numeric"
                  required
                />
                {form.phone && !phoneValid && (
                  <p className="mt-1 text-xs font-semibold text-rose-700 dark:text-rose-200">
                    Enter valid 10 digits.
                  </p>
                )}
              </Field>

              <Field label="Category">
                <select
                  className={`select-control ${selectBase}`}
                  name="category"
                  value={form.category}
                  onChange={onChange}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred Batch">
                <select
                  className={`select-control ${selectBase}`}
                  name="preferredBatch"
                  value={form.preferredBatch}
                  onChange={onChange}
                >
                  {batchOptions.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>

              <Field label="Course Name" className="md:col-span-2">
                <input
                  className={`input-control ${inputBase}`}
                  placeholder="Example: Full Stack, Tally, SAP"
                  name="course"
                  value={form.course}
                  onChange={onChange}
                  required
                />
              </Field>

              <Field label="Message (Optional)" className="md:col-span-2">
                <textarea
                  className={`input-control ${inputBase} min-h-28 resize-y`}
                  placeholder="Share your goals or preferred timing"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={4}
                />
              </Field>
            </div>

            <motion.button
              whileTap={{ scale: 0.99 }}
              disabled={loading || !phoneValid}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl
                         bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-extrabold text-white
                         transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
              {!loading && <IconArrowRight className="h-4 w-4" />}
            </motion.button>

            {status.message && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${statusStyles}`}>
                {status.message}
              </div>
            )}

            <p className="mt-4 text-xs text-slate-500 dark:text-white/50">
              By submitting, you agree to be contacted by phone/WhatsApp for admission guidance.
            </p>
          </NeoCard>
        </motion.form>
      </div>
    </section>
  );
}

/* ----------------------------- Small Components ----------------------------- */

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-900 dark:text-white">{label}</span>
        {hint && <span className="text-xs font-semibold text-slate-500 dark:text-white/50">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function NeoContact({ href, icon, text, external = false }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex items-center gap-2 rounded-2xl border border-white/12 bg-white/60 px-4 py-3 font-semibold text-slate-900 transition
                 hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      <span className="rounded-xl bg-white/70 p-2 text-cyan-700 dark:bg-white/10 dark:text-cyan-300">
        {icon}
      </span>
      <span className="truncate">{text}</span>
    </a>
  );
}

function Benefit({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mt-0.5 rounded-xl bg-white/70 p-2 text-emerald-700 dark:bg-white/10 dark:text-emerald-200">
        {icon}
      </div>
      <div>
        <div className="font-extrabold text-slate-900 dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-slate-600 dark:text-white/60">{desc}</div>
      </div>
    </div>
  );
}