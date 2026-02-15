import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
        "group inline-flex items-center justify-center gap-2 rounded-2xl border border-peacock-border/60",
        "bg-white/35 backdrop-blur-xl text-peacock-navy/80 hover:bg-white/50",
        "active:scale-[0.98] transition",
        compact ? "h-10 w-10" : "h-10 px-4",
      ].join(" ")}
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/40 border border-peacock-border/50">
        {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
      </span>

      {!compact && (
        <span className="text-xs font-semibold">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="group relative rounded-xl px-3 py-2 text-sm font-semibold text-peacock-navy/70 transition hover:text-peacock-navy"
    >
      {({ isActive }) => (
        <>
          <span className="relative z-10">{label}</span>

          {/* hover background */}
          <span className="absolute inset-0 rounded-xl bg-white/0 transition group-hover:bg-white/35" />

          {/* underline */}
          <span
            className={[
              "absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full transition",
              isActive ? "bg-peacock-blue" : "bg-peacock-blue/0 group-hover:bg-peacock-blue/60",
            ].join(" ")}
          />

          {/* active ring */}
          {isActive && (
            <span className="absolute inset-0 rounded-xl ring-1 ring-peacock-border/60 bg-white/25" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function PublicNavbar({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="border-b border-peacock-border/60 bg-peacock-bg/45 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <NavLink
            to="/"
            className="group flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-peacock-border/60 bg-white/35 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.55)]">
              <img
                src="/logo.jpeg"
                alt="Quest Technology"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 ring-1 ring-white/20" />
            </span>

            <span className="hidden sm:block leading-tight">
              <span className="block text-[10px] uppercase tracking-[0.25em] text-peacock-muted">
                Quest Technology
              </span>
              <span className="block text-sm font-semibold text-peacock-navy">
                Skill Training Institute
              </span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}

            <div className="mx-2 h-8 w-px bg-peacock-border/60" />

            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

            <NavLink
              to="/admin/login"
              className="ml-2 inline-flex items-center gap-2 rounded-2xl bg-peacock-blue px-4 py-2 text-xs font-bold text-white shadow-[0_18px_45px_-25px_rgba(2,132,199,0.65)]
                         transition hover:brightness-110 active:scale-[0.98]"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-peacock-border/60 bg-white/35 text-peacock-navy/80
                         backdrop-blur-xl transition hover:bg-white/50 active:scale-[0.98]"
            >
              {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer (animated) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* sheet */}
            <motion.div
              className="fixed left-0 right-0 top-[4.5rem] z-50 md:hidden"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="rounded-2xl border border-peacock-border/60 bg-peacock-bg/60 backdrop-blur-xl shadow-[0_30px_80px_-45px_rgba(0,0,0,0.7)] p-3">
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl px-3 py-3 text-sm font-semibold text-peacock-navy/80 hover:bg-white/35 transition"
                      >
                        {item.label}
                      </NavLink>
                    ))}

                    <div className="my-2 h-px w-full bg-peacock-border/60" />

                    <NavLink
                      to="/admin/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peacock-blue px-4 py-3 text-sm font-bold text-white
                                 transition hover:brightness-110 active:scale-[0.98]"
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
