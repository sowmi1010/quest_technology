import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
     ${
       isActive
         ? "bg-peacock-blue text-white"
         : "text-peacock-navy hover:bg-peacock-bg"
     }`;

  return (
    <aside className="w-64 bg-white border-r border-peacock-border flex flex-col">
      {/* LOGO */}
      <div className="h-16 flex items-center px-5 border-b border-peacock-border">
        <h1 className="text-lg font-bold text-peacock-navy">
          Quest <span className="text-peacock-green">Admin</span>
        </h1>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-auto py-4 space-y-1">
        <NavLink to="/admin/dashboard" className={linkClass}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/admin/enquiries" className={linkClass}>
          📞 Enquiries
        </NavLink>

        <NavLink to="/admin/students" className={linkClass}>
          🎓 Students
        </NavLink>

        <NavLink to="/admin/courses" className={linkClass}>
          📚 Courses
        </NavLink>

        <NavLink to="/admin/attendance" className={linkClass}>
          ✅ Attendance
        </NavLink>

        <NavLink to="/admin/attendance/report" className={linkClass}>
          📅 Attendance Report
        </NavLink>

  

        <NavLink to="/admin/feedback" className={linkClass}>
          ⭐ Feedback
        </NavLink>


        <NavLink to="/admin/certificates" className={linkClass}>
          🧾 Certificates
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-peacock-border">
        <button
          onClick={logout}
          className="w-full bg-peacock-green text-white rounded-xl py-2 font-semibold hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
