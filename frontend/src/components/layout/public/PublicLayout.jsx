import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

  // Persist theme
  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Apply theme to <html> for global styling support
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // page transition variants
  const pageAnim = useMemo(
    () => ({
      initial: { opacity: 0, y: 10, filter: "blur(8px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: -8, filter: "blur(8px)" },
    }),
    []
  );

  return (
    <div
      className="public-theme public-shell relative min-h-screen overflow-x-clip bg-peacock-bg/40"
      data-theme={theme}
    >
      {/* BACKGROUND LAYERS */}
      <div className="pointer-events-none fixed inset-0 -z-30 bg-mesh opacity-70" />

      {/* Premium vignette */}
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_20%,rgba(34,197,94,0.14),transparent_55%),radial-gradient(1000px_circle_at_40%_110%,rgba(168,85,247,0.10),transparent_55%)]" />

      {/* Floating blobs (animated) */}
      <motion.div
        className="pointer-events-none fixed -left-28 top-24 -z-20 h-96 w-96 rounded-full bg-peacock-blue/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed -right-28 top-56 -z-20 h-96 w-96 rounded-full bg-peacock-green/18 blur-3xl"
        animate={{ x: [0, -55, 0], y: [0, -25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[-140px] -z-20 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* NAVBAR */}
      <div className="sticky top-0 z-50">
        <div className="border-b border-peacock-border/60 bg-peacock-bg/45 backdrop-blur-xl">
          <PublicNavbar theme={theme} onToggleTheme={toggleTheme} />
        </div>
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
