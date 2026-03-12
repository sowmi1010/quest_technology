import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const THEME_STORAGE_KEY = "quest-public-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function PublicLayout() {
  const [theme, setTheme] = useState(getInitialTheme);
  const location = useLocation();
  const reduce = useReducedMotion();

  // Persist theme
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Apply theme to <html> for global styling support
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  // page transition variants
  const pageAnim = useMemo(
    () => ({
      initial: { opacity: 0, y: reduce ? 0 : 10, filter: "blur(10px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: reduce ? 0 : -8, filter: "blur(10px)" },
    }),
    [reduce]
  );

  return (
    <div
      className="public-theme public-shell relative min-h-screen overflow-x-clip bg-white/40 dark:bg-slate-950/40"
      data-theme={theme}
    >
      {/* BACKGROUND LAYERS */}
      <div className="pointer-events-none fixed inset-0 -z-30">
        {/* Neo mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.18),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.16),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.12),transparent_60%)] opacity-80" />
        <div className="absolute inset-0 dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.09),transparent_60%)]" />

        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1400px_circle_at_50%_-10%,rgba(255,255,255,0.75),transparent_55%)] dark:bg-[radial-gradient(1200px_circle_at_50%_-10%,rgba(2,6,23,0.65),transparent_55%)]" />

        {/* subtle grain */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(0,0,0,0.6)_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-[0.10]" />
      </div>

      {/* Floating blobs (animated) */}
      <motion.div
        className="pointer-events-none fixed -left-28 top-24 -z-20 h-96 w-96 rounded-full bg-cyan-400/18 blur-3xl dark:bg-cyan-400/14"
        animate={reduce ? {} : { x: [0, 60, 0], y: [0, 30, 0] }}
        transition={reduce ? {} : { duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed -right-28 top-56 -z-20 h-96 w-96 rounded-full bg-violet-400/16 blur-3xl dark:bg-violet-400/12"
        animate={reduce ? {} : { x: [0, -55, 0], y: [0, -25, 0] }}
        transition={reduce ? {} : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed left-1/2 bottom-[-160px] -z-20 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white/25 blur-3xl dark:bg-white/10"
        animate={reduce ? {} : { y: [0, -25, 0] }}
        transition={reduce ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* NAVBAR */}
      <div className="sticky top-0 z-50">
        <div className="border-b border-white/10 bg-white/55 backdrop-blur-2xl dark:bg-slate-950/45">
          <PublicNavbar theme={theme} onToggleTheme={toggleTheme} />
        </div>
        {/* top glow hairline */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </div>

      {/* CONTENT */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageAnim}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="py-6 sm:py-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}