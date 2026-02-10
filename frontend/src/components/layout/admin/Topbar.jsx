import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Topbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  // back
  const goBack = () => navigate(-1);

  // forward
  const goForward = () => navigate(1);

  // global search submit
  const onSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    // you can later connect API search
    navigate(`/admin/search?q=${encodeURIComponent(search)}`);

    setSearch("");
  };

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="h-16 bg-white border-b border-peacock-border flex items-center justify-between px-4 shadow-sm">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* Back */}
        <button
          onClick={goBack}
          className="px-3 py-2 rounded-lg bg-peacock-bg hover:bg-peacock-border transition"
          title="Back"
        >
          ←
        </button>

        {/* Forward */}
        <button
          onClick={goForward}
          className="px-3 py-2 rounded-lg bg-peacock-bg hover:bg-peacock-border transition"
          title="Forward"
        >
          →
        </button>

        {/* Title */}
        <h2 className="ml-2 font-semibold text-peacock-navy text-lg hidden sm:block">
          Admin Panel
        </h2>
      </div>

      {/* CENTER SEARCH */}
      <form onSubmit={onSearch} className="flex-1 max-w-xl mx-6 hidden md:block">
        <input
          type="text"
          placeholder="Search student name / phone / enquiry / payment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-peacock-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-peacock-blue"
        />
      </form>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {/* Admin Name */}
        <div className="hidden sm:block text-sm font-medium text-peacock-navy">
          👤 {admin?.name || "Admin"}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-peacock-green text-white font-semibold hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
