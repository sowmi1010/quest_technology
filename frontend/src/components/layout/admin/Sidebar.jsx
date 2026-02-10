import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PhoneCall,
  GraduationCap,
  BookOpen,
  CheckSquare,
  CalendarDays,
  Star,
  Award,
  LogOut,
} from "lucide-react";

export default function Sidebar({ collapsed = false }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/enquiries", label: "Enquiries", icon: PhoneCall },
    { to: "/admin/students", label: "Students", icon: GraduationCap },
    { to: "/admin/courses", label: "Courses", icon: BookOpen },
    { to: "/admin/attendance", label: "Attendance", icon: CheckSquare },
    { to: "/admin/attendance/report", label: "Attendance Report", icon: CalendarDays },
    { to: "/admin/feedback", label: "Feedback", icon: Star },
    { to: "/admin/certificates", label: "Certificates", icon: Award },
  ];

  const linkClass = ({ isActive }) =>
    [
      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
      "text-white/70 hover:text-white",
      "hover:bg-white/10 active:scale-[0.99]",
      isActive ? "bg-white/10 text-white" : "",
      collapsed ? "justify-center" : "",
    ].join(" ");

  return (
    <aside className="h-full w-full flex flex-col">
      {/* LOGO */}
      <div className="h-16 flex items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 border border-white/10 shadow-sm">
            <span className="text-white font-bold">Q</span>
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">Quest</div>
              <div className="text-xs text-white/60">Admin Panel</div>
            </div>
          )}
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={linkClass} end>
              {({ isActive }) => (
                <>
                  {/* left active indicator */}
                  <span
                    className={[
                      "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition",
                      isActive ? "bg-sky-400" : "bg-transparent",
                    ].join(" ")}
                  />

                  <div
                    className={[
                      "grid h-9 w-9 place-items-center rounded-xl border transition",
                      isActive
                        ? "bg-white/10 border-white/15"
                        : "bg-white/5 border-white/10 group-hover:bg-white/10",
                    ].join(" ")}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}

                  {/* subtle active glow */}
                  {isActive && (
                    <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={logout}
          className={[
            "w-full rounded-xl px-3 py-2.5 font-semibold transition",
            "bg-white/10 text-white hover:bg-white/15 active:scale-[0.99]",
            "flex items-center gap-3",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10">
            <LogOut className="h-5 w-5" />
          </div>
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
