import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { IconMail, IconMapPin, IconPhone } from "../../ui/PublicIcons";
import { PUBLIC_CONTACT } from "../../../utils/publicUi";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/gallery", label: "Gallery" },
  { to: "/enquiry", label: "Enquiry" },
];

const ease = [0.16, 1, 0.3, 1];

export default function PublicFooter() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduce ? 0 : 12, filter: "blur(10px)" },
      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
    }),
    [reduce]
  );

  return (
    <footer className="relative mt-14 overflow-hidden">
      {/* Neo mesh background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_360px_at_12%_-10%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(850px_360px_at_92%_10%,rgba(167,139,250,0.14),transparent_60%),radial-gradient(900px_420px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_360px_at_12%_-10%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(850px_360px_at_92%_10%,rgba(167,139,250,0.11),transparent_60%),radial-gradient(900px_420px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      {/* top glow line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/70 via-violet-500/60 to-cyan-500/70" />

      <div className="border-t border-white/10 bg-white/55 backdrop-blur-2xl dark:bg-slate-950/45">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
        >
          <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr_1fr]">
            {/* Brand */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-slate-600 dark:text-white/60">
                Quest Technology
              </p>

              <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Career-focused learning, built for outcomes.
              </h3>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-white/60">
                We train students and professionals in IT, accounts, mechanical tools, school tuition, and
                exam-focused programs with practical guidance.
              </p>

              {/* mini highlights */}
              <div className="mt-5 flex flex-wrap gap-2">
                {["Practical Training", "Job Support", "Expert Mentors"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/14 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white/75"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-6 h-px w-32 bg-gradient-to-r from-cyan-500 to-violet-500" />
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Quick Links</h4>

              <div className="mt-4 flex flex-col gap-3">
                {links.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group inline-flex w-fit items-center text-sm font-semibold text-slate-600 transition hover:text-cyan-700 dark:text-white/60 dark:hover:text-cyan-300"
                  >
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ))}

                <Link
                  to="/admin/login"
                  className="group inline-flex w-fit items-center text-sm font-semibold text-slate-600 transition hover:text-cyan-700 dark:text-white/60 dark:hover:text-cyan-300"
                >
                  <span className="relative">
                    Admin Login
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="mt-2 w-fit rounded-2xl border border-white/14 bg-white/60 px-4 py-2 text-sm font-extrabold text-slate-900 transition
                             hover:bg-white/80 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Back to top
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Contact</h4>

              <div className="mt-4 space-y-3">
                <a
                  href={`tel:${PUBLIC_CONTACT.phoneE164}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm text-slate-600
                             transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/14 bg-white/60 text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300">
                    <IconPhone className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-500 dark:text-white/50">Phone</div>
                    <div className="font-extrabold text-slate-900 group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-300">
                      {PUBLIC_CONTACT.phoneDisplay}
                    </div>
                  </div>
                </a>

                {PUBLIC_CONTACT.phoneE164Secondary && (
                  <a
                    href={`tel:${PUBLIC_CONTACT.phoneE164Secondary}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm text-slate-600
                               transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/14 bg-white/60 text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-300">
                      <IconPhone className="h-4 w-4" />
                    </span>
                    <div className="leading-tight">
                      <div className="text-xs font-semibold text-slate-500 dark:text-white/50">Phone 2</div>
                      <div className="font-extrabold text-slate-900 group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
                        {PUBLIC_CONTACT.phoneDisplaySecondary || PUBLIC_CONTACT.phoneE164Secondary}
                      </div>
                    </div>
                  </a>
                )}

                <a
                  href={`mailto:${PUBLIC_CONTACT.email}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm text-slate-600
                             transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/14 bg-white/60 text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300">
                    <IconMail className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-500 dark:text-white/50">Email</div>
                    <div className="font-extrabold text-slate-900 group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-300">
                      {PUBLIC_CONTACT.email}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3 rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/14 bg-white/60 text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-300">
                    <IconMapPin className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-500 dark:text-white/50">Location</div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{PUBLIC_CONTACT.location}</div>
                  </div>
                </div>

                {(PUBLIC_CONTACT.twitter || PUBLIC_CONTACT.instagram) && (
                  <div className="rounded-2xl border border-white/14 bg-white/60 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                    <div className="text-xs font-semibold text-slate-500 dark:text-white/50">Social</div>
                    <div className="mt-1 flex flex-wrap gap-3">
                      {PUBLIC_CONTACT.twitter && (
                        <a
                          href={PUBLIC_CONTACT.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-slate-900 underline underline-offset-4 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-300"
                        >
                          X (Twitter)
                        </a>
                      )}
                      {PUBLIC_CONTACT.instagram && (
                        <a
                          href={PUBLIC_CONTACT.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-slate-900 underline underline-offset-4 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-white/50">
                Reach out for course details, batch timings, and fee information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-white/45 backdrop-blur-2xl dark:bg-slate-950/55">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-white/60">
          <span>Copyright {year} Quest Technology. All rights reserved.</span>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="font-semibold hover:text-cyan-700 transition dark:hover:text-cyan-300">
              Privacy
            </Link>
            <Link to="/terms" className="font-semibold hover:text-violet-700 transition dark:hover:text-violet-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}