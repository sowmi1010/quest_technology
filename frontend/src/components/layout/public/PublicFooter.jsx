import { Link } from "react-router-dom";
import { IconMail, IconMapPin, IconPhone } from "../../ui/PublicIcons";
import { PUBLIC_CONTACT } from "../../../utils/publicUi";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/gallery", label: "Gallery" },
  { to: "/enquiry", label: "Enquiry" },
];

export default function PublicFooter() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-14 border-t border-peacock-border/60 bg-peacock-bg/55 backdrop-blur-xl">
      {/* top glow line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-peacock-blue/70 via-peacock-green/60 to-peacock-blue/70" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr_1fr]">
          {/* Brand */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-peacock-muted/80">
              Quest Technology
            </p>

            <h3 className="mt-2 text-xl font-bold text-peacock-navy">
              Career-focused learning, built for outcomes.
            </h3>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-peacock-muted">
              We train students and professionals in IT, accounts, mechanical tools, school tuition,
              and exam-focused programs with practical guidance.
            </p>

            {/* mini highlights */}
            <div className="mt-5 flex flex-wrap gap-2">
              {["Practical Training", "Job Support", "Expert Mentors"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-peacock-border/60 bg-white/35 px-3 py-1 text-xs font-medium text-peacock-navy/80"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 h-px w-32 bg-gradient-to-r from-peacock-blue to-peacock-green" />
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-peacock-navy">Quick Links</h4>

            <div className="mt-4 flex flex-col gap-3">
              {links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group inline-flex w-fit items-center text-sm text-peacock-muted transition hover:text-peacock-blue"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-peacock-blue transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}

              <Link
                to="/admin/login"
                className="group inline-flex w-fit items-center text-sm text-peacock-muted transition hover:text-peacock-blue"
              >
                <span className="relative">
                  Admin Login
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-peacock-blue transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>

              <button
                type="button"
                onClick={scrollToTop}
                className="mt-2 w-fit rounded-xl border border-peacock-border/60 bg-white/35 px-4 py-2 text-sm font-semibold text-peacock-navy/80
                           transition hover:bg-white/50 active:scale-[0.98]"
              >
                Back to top
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-peacock-navy">Contact</h4>

            <div className="mt-4 space-y-3">
              <a
                href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                className="group flex items-center gap-3 rounded-2xl border border-peacock-border/60 bg-white/35 px-4 py-3 text-sm text-peacock-muted
                           transition hover:bg-white/50 hover:text-peacock-blue"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-peacock-border/50 bg-white/40">
                  <IconPhone className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-xs text-peacock-muted/80">Phone</div>
                  <div className="font-semibold text-peacock-navy/80 group-hover:text-peacock-blue">
                    {PUBLIC_CONTACT.phoneDisplay}
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${PUBLIC_CONTACT.email}`}
                className="group flex items-center gap-3 rounded-2xl border border-peacock-border/60 bg-white/35 px-4 py-3 text-sm text-peacock-muted
                           transition hover:bg-white/50 hover:text-peacock-blue"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-peacock-border/50 bg-white/40">
                  <IconMail className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-xs text-peacock-muted/80">Email</div>
                  <div className="font-semibold text-peacock-navy/80 group-hover:text-peacock-blue">
                    {PUBLIC_CONTACT.email}
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-2xl border border-peacock-border/60 bg-white/35 px-4 py-3 text-sm text-peacock-muted">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-peacock-border/50 bg-white/40">
                  <IconMapPin className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-xs text-peacock-muted/80">Location</div>
                  <div className="font-semibold text-peacock-navy/80">
                    {PUBLIC_CONTACT.location}
                  </div>
                </div>
              </div>
            </div>

            {/* optional note */}
            <p className="mt-4 text-xs text-peacock-muted/80">
              Reach out for course details, batch timings, and fee information.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-peacock-border/60 bg-peacock-bg/45">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-peacock-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Copyright {year} Quest Technology. All rights reserved.</span>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-peacock-blue transition">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-peacock-blue transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
