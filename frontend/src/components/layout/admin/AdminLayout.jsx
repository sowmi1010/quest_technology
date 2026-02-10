import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(168,85,247,0.20),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(2,6,23,0.92))]">
      {/* subtle moving glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <motion.div
          className="absolute -top-40 -left-40 h-[380px] w-[380px] rounded-full bg-sky-400/20 blur-3xl"
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-44 -right-44 h-[420px] w-[420px] rounded-full bg-fuchsia-400/20 blur-3xl"
          animate={{ x: [0, -70, 0], y: [0, -30, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar wrapper with animation */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 88 : 280 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="h-full shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl"
        >
          {/* Pass state to Sidebar if you want it to render icons-only */}
          <Sidebar collapsed={sidebarCollapsed} />
        </motion.aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar glass */}
          <div className="sticky top-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <Topbar
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden p-4 sm:p-6">
            <motion.main
              className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* header strip inside card (optional) */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                </div>
                <div className="text-xs text-white/60">Admin Panel</div>
              </div>

              {/* scroll area */}
              <div className="h-[calc(100%-52px)] overflow-auto px-4 py-4 sm:px-6 sm:py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.main>
          </div>
        </div>
      </div>
    </div>
  );
}
