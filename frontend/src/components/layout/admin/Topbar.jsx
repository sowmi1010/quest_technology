import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  LogOut,
  PanelLeft,
  X,
} from "lucide-react";

export default function Topbar({ onToggleSidebar, sidebarCollapsed }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || "{}");
    } catch {
      return {};
    }
  }, []);

  // back
  const goBack = () => navigate(-1);

  // forward
  const goForward = () => navigate(1);

  // global search submit
  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;

    navigate(`/admin/search?q=${encodeURIComponent(q)}`);
    setSearch("");
    setMobileSearchOpen(false);
  };

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  const initials =
    (admin?.name || "Admin")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("") || "A";

  return (
    <div className="h-16 px-3 sm:px-4">
      <div className="h-full flex items-center justify-between gap-3">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-[0.98] transition"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* Back / Forward */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={goBack}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-[0.98] transition"
              title="Back"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              onClick={goForward}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-[0.98] transition"
              title="Forward"
              type="button"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Title */}
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-semibold text-white truncate">
              Admin Panel
            </div>
            <div className="hidden sm:block text-xs text-white/60 truncate">
              Manage students, enquiries, courses, attendance
            </div>
          </div>
        </div>

        {/* CENTER SEARCH (desktop) */}
        <form onSubmit={onSearch} className="hidden md:block flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/45" />
            <input
              type="text"
              placeholder="Search student / phone / enquiry / payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none
                         focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/40 transition"
            />
          </div>
        </form>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-[0.98] transition"
            title="Search"
            type="button"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Admin mini profile */}
          <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 border border-white/10 text-white font-semibold">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">
                {admin?.name || "Admin"}
              </div>
              <div className="text-xs text-white/60">
                {admin?.email || "Administrator"}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white
                       hover:bg-white/15 active:scale-[0.98] transition"
            type="button"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile search modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="mx-auto mt-20 w-[92%] max-w-lg rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-white">Search</div>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
                type="button"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/45" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search student / phone / enquiry / payment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none
                             focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/40 transition"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
