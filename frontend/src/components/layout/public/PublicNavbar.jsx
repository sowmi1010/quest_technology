import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconArrowRight,
  IconMenu,
  IconMoon,
  IconSun,
  IconX,
} from "../../ui/PublicIcons";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/gallery", label: "Gallery" },
  { to: "/enquiry", label: "Enquiry" },
];

function ThemeToggle({ theme, onToggleTheme, compact = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={[
        "group inline-flex items-center justify-center gap-2 rounded-2xl",
        "border border-white/12 bg-white/55 text-slate-900",
        "shadow-soft backdrop-blur-2xl transition active:scale-[0.98]",
        "hover:bg-white/75 dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:hover:bg-slate-950/55",
        compact ? "h-10 w-10" : "h-10 px-4",
      ].join(" ")}
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/12 bg-white/60 dark:border-white/10 dark:bg-white/5">
        {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
      </span>

      {!compact && (
        <span className="text-xs font-extrabold tracking-wide">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink to={to} onClick={onClick} className="relative">
      {({ isActive }) => (
        <span
          className={[
            "group relative inline-flex items-center rounded-2xl px-3 py-2 text-sm font-extrabold transition",
            "text-slate-700 hover:text-slate-950 dark:text-white/70 dark:hover:text-white",
            isActive ? "text-slate-950 dark:text-white" : "",
          ].join(" ")}
        >
          {/* hover glow */}
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-white/0 transition group-hover:bg-white/55 dark:group-hover:bg-white/10" />
          {/* active glass */}
          {isActive && (
            <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/12 bg-white/60 dark:border-white/10 dark:bg-white/5" />
          )}
          {/* underline */}
          <span
            className={[
              "pointer-events-none absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full transition",
              isActive ? "bg-gradient-to-r from-cyan-500 to-violet-500" : "bg-transparent group-hover:bg-cyan-500/60",
            ].join(" ")}
          />
          <span className="relative z-10">{label}</span>
        </span>
      )}
    </NavLink>
  );
}

export default function PublicNavbar({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  // close mobile nav on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Premium glass header */}
      <div className="border-b border-white/10 bg-white/55 backdrop-blur-2xl dark:bg-slate-950/45">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <NavLink
            to="/"
            className="group flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/60 shadow-soft dark:border-white/10 dark:bg-white/5">
              <img
                src="/logo.jpeg"
                alt="Quest Technology"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 ring-1 ring-white/15" />
              <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-cyan-400/15 blur-2xl" />
            </span>

            <span className="hidden sm:block leading-tight">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-600 dark:text-white/60">
                Quest Technology
              </span>
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                Skill Training Institute
              </span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}

            <div className="mx-2 h-8 w-px bg-white/12 dark:bg-white/10" />

            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

            <NavLink
              to="/admin/login"
              className={[
                "ml-2 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold text-white",
                "bg-gradient-to-r from-cyan-500 to-violet-500",
                "shadow-[0_18px_45px_-25px_rgba(56,189,248,0.55)]",
                "transition hover:brightness-110 active:scale-[0.98]",
              ].join(" ")}
            >
              Admin Login
              <IconArrowRight className="h-4 w-4" />
            </NavLink>
          </nav>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} compact />

            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              className={[
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                "border border-white/12 bg-white/55 text-slate-900 shadow-soft backdrop-blur-2xl transition",
                "hover:bg-white/75 active:scale-[0.98]",
                "dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:hover:bg-slate-950/55",
              ].join(" ")}
            >
              {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* gradient hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent" />

      {/* Mobile drawer (animated) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* sheet */}
            <motion.div
              className="fixed left-0 right-0 top-[4.5rem] z-50 md:hidden"
              initial={reduce ? { opacity: 0 } : { y: -10, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -10, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="overflow-hidden rounded-3xl border border-white/12 bg-white/70 p-3 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.7)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
                  {/* glow */}
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
                  <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-violet-400/14 blur-3xl" />

                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          [
                            "rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                            "text-slate-800 hover:bg-white/70 dark:text-white/80 dark:hover:bg-white/10",
                            isActive
                              ? "border border-white/12 bg-white/65 dark:border-white/10 dark:bg-white/5"
                              : "border border-transparent",
                          ].join(" ")
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}

                    <div className="my-2 h-px w-full bg-white/12 dark:bg-white/10" />

                    <NavLink
                      to="/admin/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
                    >
                      Admin Login
                      <IconArrowRight className="h-4 w-4" />
                    </NavLink>
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}