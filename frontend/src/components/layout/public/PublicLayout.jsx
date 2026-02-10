import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
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

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="public-theme public-shell relative min-h-screen overflow-x-clip" data-theme={theme}>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-mesh" />
      <div className="pointer-events-none fixed -left-24 top-20 -z-10 h-80 w-80 rounded-full bg-peacock-blue/20 blur-3xl float-slow" />
      <div className="pointer-events-none fixed -right-24 top-52 -z-10 h-80 w-80 rounded-full bg-peacock-green/20 blur-3xl float-slow" />

      <PublicNavbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="relative flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
