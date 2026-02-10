import { Link } from "react-router-dom";
import { IconMail, IconMapPin, IconPhone } from "../../ui/PublicIcons";
import { PUBLIC_CONTACT } from "../../../utils/publicUi";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/enquiry", label: "Enquiry" },
];

export default function PublicFooter() {
  return (
    <footer className="mt-14 border-t border-peacock-border/70 bg-peacock-bg/55 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.26em] text-peacock-muted/80">
            Quest Technology
          </p>
          <h3 className="mt-2 text-xl font-bold text-peacock-navy">Career-focused learning, built for outcomes.</h3>
          <p className="mt-3 text-sm leading-relaxed text-peacock-muted">
            We train students and professionals in IT, accounts, mechanical tools, school tuition,
            and exam-focused programs with practical guidance.
          </p>
          <div className="mt-4 h-px w-28 bg-gradient-to-r from-peacock-blue to-peacock-green" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-peacock-navy">Quick Links</h4>
          <div className="mt-3 flex flex-col gap-2">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-peacock-muted transition hover:translate-x-0.5 hover:text-peacock-blue"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="text-sm text-peacock-muted transition hover:translate-x-0.5 hover:text-peacock-blue"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-peacock-navy">Contact</h4>
          <div className="mt-3 space-y-2 text-sm text-peacock-muted">
            <a
              href={`tel:${PUBLIC_CONTACT.phoneE164}`}
              className="flex items-center gap-2 transition hover:text-peacock-blue"
            >
              <IconPhone className="h-4 w-4" />
              <span>{PUBLIC_CONTACT.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="flex items-center gap-2 transition hover:text-peacock-blue"
            >
              <IconMail className="h-4 w-4" />
              <span>{PUBLIC_CONTACT.email}</span>
            </a>
            <p className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4" />
              <span>{PUBLIC_CONTACT.location}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-peacock-border/60 bg-peacock-bg/45">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-peacock-muted sm:px-6">
          Copyright {new Date().getFullYear()} Quest Technology. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
