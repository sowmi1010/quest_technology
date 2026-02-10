import { useState } from "react";
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

export default function Enquiry() {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      await submitEnquiry(form);
      setStatus({ type: "success", message: "Enquiry submitted successfully. Our team will contact you soon." });
      setForm(initialForm);
    } catch {
      setStatus({ type: "error", message: "Submission failed. Please try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <aside className="surface-card animate-fade-up relative overflow-hidden p-7">
          <div className="pointer-events-none absolute -left-10 top-20 h-44 w-44 rounded-full bg-peacock-blue/15 blur-3xl" />
          <p className="badge-soft">Admissions Desk</p>
          <h1 className="mt-4 text-3xl font-bold text-peacock-navy">Tell us what you want to learn</h1>
          <p className="mt-3 text-sm leading-relaxed text-peacock-muted">
            Submit your details and we will help you select the right course, batch timing, and fee plan.
          </p>

          <div className="mt-6 space-y-3 text-sm text-peacock-muted">
            <a
              href={`tel:${PUBLIC_CONTACT.phoneE164}`}
              className="surface-soft flex items-center gap-2 rounded-xl px-3 py-2 transition hover:border-peacock-blue/40"
            >
              <IconPhone className="h-4 w-4 text-peacock-blue" />
              <span>{PUBLIC_CONTACT.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="surface-soft flex items-center gap-2 rounded-xl px-3 py-2 transition hover:border-peacock-blue/40"
            >
              <IconMail className="h-4 w-4 text-peacock-blue" />
              <span>{PUBLIC_CONTACT.email}</span>
            </a>
            <a
              href={PUBLIC_CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="surface-soft flex items-center gap-2 rounded-xl px-3 py-2 transition hover:border-peacock-blue/40"
            >
              <IconMessageCircle className="h-4 w-4 text-peacock-blue" />
              <span>WhatsApp Support</span>
            </a>
            <p className="surface-soft flex items-center gap-2 rounded-xl px-3 py-2">
              <IconMapPin className="h-4 w-4 text-peacock-blue" />
              <span>{PUBLIC_CONTACT.location}</span>
            </p>
          </div>

          <div className="mt-6 space-y-2 text-sm text-peacock-ink">
            <p className="flex items-start gap-2">
              <IconCheckCircle className="mt-0.5 h-4 w-4 text-peacock-green" />
              <span>Guidance from counselors before enrollment.</span>
            </p>
            <p className="flex items-start gap-2">
              <IconCalendar className="mt-0.5 h-4 w-4 text-peacock-green" />
              <span>Flexible batches for students and professionals.</span>
            </p>
            <p className="flex items-start gap-2">
              <IconMessageCircle className="mt-0.5 h-4 w-4 text-peacock-green" />
              <span>Fast response through call and WhatsApp support.</span>
            </p>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="surface-card animate-fade-up-delay-1 p-7 md:p-8">
          <h2 className="text-2xl font-bold text-peacock-navy">Enquiry Form</h2>
          <p className="mt-1 text-sm text-peacock-muted">Fill in your details to get a personalized callback.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-peacock-navy">Full Name</span>
              <input
                className="input-control"
                placeholder="Your name"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-peacock-navy">Phone Number</span>
              <input
                className="input-control"
                placeholder="10-digit phone number"
                name="phone"
                value={form.phone}
                onChange={onChange}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-peacock-navy">Category</span>
              <select className="select-control" name="category" value={form.category} onChange={onChange}>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-peacock-navy">Preferred Batch</span>
              <select className="select-control" name="preferredBatch" value={form.preferredBatch} onChange={onChange}>
                {batchOptions.map((batch) => (
                  <option key={batch}>{batch}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-peacock-navy">Course Name</span>
              <input
                className="input-control"
                placeholder="Example: Full Stack, Tally, SAP"
                name="course"
                value={form.course}
                onChange={onChange}
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-peacock-navy">Message (Optional)</span>
              <textarea
                className="input-control min-h-28 resize-y"
                placeholder="Share your goals or preferred timing"
                name="message"
                value={form.message}
                onChange={onChange}
                rows={4}
              />
            </label>
          </div>

          <button disabled={loading} className="btn-primary mt-6 w-full !justify-center disabled:opacity-60">
            {loading ? "Submitting..." : "Submit Enquiry"}
            {!loading && <IconArrowRight className="h-4 w-4" />}
          </button>

          {status.message && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-peacock-green/30 bg-peacock-green/10 text-peacock-green"
                  : "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
