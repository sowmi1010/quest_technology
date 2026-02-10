import { useState } from "react";
import { NavLink } from "react-router-dom";
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
  { to: "/enquiry", label: "Enquiry" },
];

const linkClass = ({ isActive }) =>
  `public-nav-link ${isActive ? "public-nav-link-active" : ""}`;

function ThemeToggle({ theme, onToggleTheme, compact = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${compact ? "h-10 w-10" : "h-10 px-4"}`}
      onClick={onToggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
      {!compact && <span className="text-xs font-semibold">{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}

export default function PublicNavbar({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="public-header sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <span className="surface-soft flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl shadow-soft">
            <img src="/logo.jpeg" alt="Quest Technology" className="h-full w-full object-cover" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-peacock-muted">
              Quest Technology
            </span>
            <span className="block text-sm font-semibold text-peacock-navy">
              Skill Training Institute
            </span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}

          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

          <NavLink to="/admin/login" className="btn-primary !px-4 !py-2 text-xs">
            Admin Login
            <IconArrowRight className="h-4 w-4" />
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} compact />
          <button
            type="button"
            className="theme-toggle-btn h-10 w-10"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`public-mobile-sheet overflow-hidden border-t px-4 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-[22rem] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/admin/login"
            className="btn-primary mt-2 !justify-center"
            onClick={() => setMobileOpen(false)}
          >
            Admin Login
            <IconArrowRight className="h-4 w-4" />
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
