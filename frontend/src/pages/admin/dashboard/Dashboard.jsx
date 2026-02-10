import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    publicCourses: 0,
  });

  const [latestEnquiries, setLatestEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      // ✅ Admin courses (protected)
      const coursesRes = await api.get("/courses");
      const courses = coursesRes.data?.data || [];

      // ✅ Admin enquiries (protected)
      const enqRes = await api.get("/enquiries");
      const enquiries = enqRes.data?.data || [];

      const newEnquiries = enquiries.filter((e) => e.status === "NEW").length;
      const publicCourses = courses.filter((c) => c.isPublic).length;

      setStats({
        totalCourses: courses.length,
        publicCourses,
        totalEnquiries: enquiries.length,
        newEnquiries,
      });

      setLatestEnquiries(enquiries.slice(0, 7));
    } catch (err) {
      // If token missing/invalid, ProtectedRoute already handles redirect.
      setLatestEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-peacock-navy">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, <span className="font-semibold">{admin?.name || "Admin"}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/enquiries"
            className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
          >
            View Enquiries
          </Link>
          <Link
            to="/admin/courses"
            className="px-4 py-2 rounded-xl bg-peacock-green text-white font-semibold hover:opacity-90"
          >
            Manage Courses
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={stats.totalCourses} icon="📚" />
        <StatCard title="Public Courses" value={stats.publicCourses} icon="🌍" />
        <StatCard title="Total Enquiries" value={stats.totalEnquiries} icon="📞" />
        <StatCard title="New Enquiries" value={stats.newEnquiries} icon="🆕" />
      </div>

      {/* Content Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Latest Enquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-peacock-border overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <h2 className="font-bold text-peacock-navy">Latest Enquiries</h2>
            <Link to="/admin/enquiries" className="text-peacock-blue font-semibold underline">
              See all
            </Link>
          </div>

          {loading ? (
            <div className="p-5 text-gray-600">Loading...</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-peacock-bg">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Course</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {latestEnquiries.map((e) => (
                    <tr key={e._id} className="border-t">
                      <td className="p-3">
                        {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 font-semibold text-peacock-navy">{e.name}</td>
                      <td className="p-3">{e.phone}</td>
                      <td className="p-3">{e.course}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-lg bg-peacock-bg border border-peacock-border">
                          {e.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link
                          to={`/admin/enquiries/${e._id}`}
                          className="text-peacock-blue font-semibold underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {latestEnquiries.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-5 text-center text-gray-500">
                        No enquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-peacock-border p-5 h-fit">
          <h2 className="font-bold text-peacock-navy">Quick Actions</h2>

          <div className="mt-4 grid gap-3">
            <QuickLink to="/admin/courses/new" title="Add New Course" desc="Create course with image & syllabus" icon="➕" />
            <QuickLink to="/admin/enquiries" title="Manage Enquiries" desc="Update status, notes & follow-ups" icon="📞" />
            <QuickLink to="/admin/courses" title="Course List" desc="Edit course visibility for public" icon="📋" />
          </div>

          <button
            onClick={load}
            className="mt-5 w-full px-4 py-2 rounded-xl border border-peacock-border bg-peacock-bg font-semibold text-peacock-navy hover:bg-peacock-border"
          >
            🔄 Refresh
          </button>

          <div className="mt-4 text-xs text-gray-500">
            Next: Students, Payments, Attendance will be added here.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- small components ---------- */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-peacock-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-extrabold text-peacock-navy">
            {value}
          </div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

function QuickLink({ to, title, desc, icon }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-peacock-border p-4 hover:bg-peacock-bg transition block"
    >
      <div className="flex items-start gap-3">
        <div className="text-xl">{icon}</div>
        <div>
          <div className="font-semibold text-peacock-navy">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{desc}</div>
        </div>
      </div>
    </Link>
  );
}
