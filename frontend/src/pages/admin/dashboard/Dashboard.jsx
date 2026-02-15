import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../services/api";
import { getPaymentsOverview } from "../../../services/paymentApi";

const STATUS_META = {
  NEW: { label: "NEW", cls: "bg-blue-500/15 text-blue-200 border-blue-400/25" },
  CALLED: { label: "CALLED", cls: "bg-amber-500/15 text-amber-200 border-amber-400/25" },
  INTERESTED: { label: "INTERESTED", cls: "bg-green-500/15 text-green-200 border-green-400/25" },
  JOINED: { label: "JOINED", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-400/25" },
  NOT_INTERESTED: { label: "NOT INTERESTED", cls: "bg-red-500/15 text-red-200 border-red-400/25" },
};

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function money(v) {
  const n = Number(v || 0);
  return `Rs ${n.toLocaleString("en-IN")}`;
}

function categoryBucket(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("mech")) return "mech";
  if (n.includes("account")) return "accounts";
  if (/\bit\b/.test(n) || n.includes("information technology") || n.includes("computer")) {
    return "it";
  }
  return "other";
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    publicCourses: 0,
    totalStudents: 0,
    newStudentsMech: 0,
    newStudentsIt: 0,
    newStudentsAccounts: 0,
    newPaymentCollected: 0,
    existingPaymentCollected: 0,
    defaultPaymentDue: 0,
  });

  const [latestEnquiries, setLatestEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || "{}");
    } catch {
      return {};
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const [coursesRes, enqRes, paymentOverviewRes] = await Promise.all([
        api.get("/courses"),
        api.get("/enquiries"),
        getPaymentsOverview(),
      ]);

      const courses = coursesRes.data?.data || [];
      const enquiries = enqRes.data?.data || [];
      const paymentRows = paymentOverviewRes.data?.data || [];

      const newEnquiries = enquiries.filter((e) => e.status === "NEW").length;
      const publicCourses = courses.filter((c) => !!c.isPublic).length;

      const newStudents = paymentRows.filter((r) => r.studentGroup === "NEW");
      const newStudentsByCategory = { mech: 0, it: 0, accounts: 0 };
      for (const row of newStudents) {
        const bucket = categoryBucket(row.categoryName);
        if (bucket in newStudentsByCategory) newStudentsByCategory[bucket] += 1;
      }

      const newPaymentCollected = paymentRows
        .filter((r) => r.studentGroup === "NEW")
        .reduce((sum, r) => sum + Number(r.totalPaid || 0), 0);

      const existingPaymentCollected = paymentRows
        .filter((r) => r.studentGroup === "EXISTING")
        .reduce((sum, r) => sum + Number(r.totalPaid || 0), 0);

      const defaultPaymentDue = paymentRows.reduce(
        (sum, r) => sum + Math.max(0, Number(r.balance || 0)),
        0
      );

      const sortedEnq = [...enquiries].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setStats({
        totalCourses: courses.length,
        publicCourses,
        totalEnquiries: enquiries.length,
        newEnquiries,
        totalStudents: paymentRows.length,
        newStudentsMech: newStudentsByCategory.mech,
        newStudentsIt: newStudentsByCategory.it,
        newStudentsAccounts: newStudentsByCategory.accounts,
        newPaymentCollected,
        existingPaymentCollected,
        defaultPaymentDue,
      });

      setLatestEnquiries(sortedEnq.slice(0, 7));
    } catch (err) {
      setLatestEnquiries([]);
      setErrMsg("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
            Admin Panel
          </p>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            Welcome back,{" "}
            <span className="font-semibold text-white">
              {admin?.name || "Admin"}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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

          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {errMsg && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          ❌ {errMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          hint="All courses in admin panel"
          icon="📚"
        />
        <StatCard
          title="Public Courses"
          value={stats.publicCourses}
          hint="Visible in public website"
          icon="🌍"
          accent="green"
        />
        <StatCard
          title="Total Enquiries"
          value={stats.totalEnquiries}
          hint="All enquiries received"
          icon="📞"
        />
        <StatCard
          title="New Enquiries"
          value={stats.newEnquiries}
          hint="Needs follow-up"
          icon="🆕"
          accent="blue"
        />
      </div>

      {/* Student & Payment Snapshot (Live) */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-sm font-bold text-white">Live Student & Payment Snapshot</div>
        <div className="mt-1 text-xs text-white/55">
          Auto-fetched from current database (not manual entry).
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="New Students - Mech"
            value={stats.newStudentsMech}
            hint="Current month"
            icon="M"
            accent="blue"
          />
          <StatCard
            title="New Students - IT"
            value={stats.newStudentsIt}
            hint="Current month"
            icon="IT"
            accent="blue"
          />
          <StatCard
            title="New Students - Accounts"
            value={stats.newStudentsAccounts}
            hint="Current month"
            icon="A"
            accent="blue"
          />
          <StatCard
            title="New Payment Collected"
            value={money(stats.newPaymentCollected)}
            hint="Collected from new students"
            icon="Rs"
            accent="green"
          />
          <StatCard
            title="Existing Payment Collected"
            value={money(stats.existingPaymentCollected)}
            hint="Collected from existing students"
            icon="Rs"
            accent="green"
          />
          <StatCard
            title="Default Payment Due"
            value={money(stats.defaultPaymentDue)}
            hint="Pending balance amount"
            icon="Rs"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Latest Enquiries */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-white font-bold text-lg">Latest Enquiries</h2>
              <p className="text-xs text-white/50 mt-1">Showing latest 7 submissions.</p>
            </div>
            <Link to="/admin/enquiries" className="text-peacock-blue font-semibold underline">
              See all
            </Link>
          </div>

          {loading ? (
            <div className="p-5 text-white/70">Loading...</div>
          ) : latestEnquiries.length === 0 ? (
            <div className="p-6 text-white/60">No enquiries found yet.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Phone</th>
                    <th className="p-4 text-left">Course</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {latestEnquiries.map((e) => {
                    const meta = STATUS_META[e.status] || {
                      label: e.status || "-",
                      cls: "bg-white/5 text-white/70 border-white/10",
                    };

                    return (
                      <tr key={e._id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-4 text-white/70">{fmtDate(e.createdAt)}</td>

                        <td className="p-4">
                          <div className="font-semibold text-white">{e.name}</div>
                          <div className="text-xs text-white/45">
                            {e.category || "-"} • {e.preferredBatch || "-"}
                          </div>
                        </td>

                        <td className="p-4">
                          <a
                            href={`tel:${e.phone}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-semibold text-white hover:bg-white/10"
                          >
                            📞 {e.phone}
                          </a>
                        </td>

                        <td className="p-4 text-white/70">{e.course || "-"}</td>

                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>

                        <td className="p-4">
                          <Link
                            to={`/admin/enquiries/${e._id}`}
                            className="text-peacock-blue font-semibold underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="h-fit rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Quick Actions</h2>
            <span className="text-xs text-white/45">Shortcuts</span>
          </div>

          <div className="mt-4 grid gap-3">
            <QuickLink to="/admin/courses/new" title="Add New Course" desc="Create course with image & syllabus" icon="➕" />
            <QuickLink to="/admin/enquiries" title="Manage Enquiries" desc="Update status, notes & follow-ups" icon="📞" />
            <QuickLink to="/admin/courses" title="Course List" desc="Edit course visibility for public" icon="📋" />
            <QuickLink to="/admin/students" title="Students" desc="Profiles, attendance & payments" icon="🎓" />
            <QuickLink to="/admin/payments" title="Payments" desc="View new, existing and due payment tabs" icon="💳" />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
            Live cards above are auto-calculated from real student, enquiry and payment data.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- components ---------- */

function StatCard({ title, value, hint, icon, accent }) {
  const accentCls =
    accent === "green"
      ? "border-emerald-400/20 bg-emerald-400/10"
      : accent === "blue"
      ? "border-blue-400/20 bg-blue-400/10"
      : "border-white/10 bg-white/5";

  return (
    <div className={`rounded-2xl border backdrop-blur-xl p-5 ${accentCls}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-white/50">{title}</div>
          <div className="mt-1 text-3xl font-extrabold text-white">{value}</div>
          {hint && <div className="mt-1 text-xs text-white/45">{hint}</div>}
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
      className="group block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
    >
      <div className="flex items-start gap-3">
        <div className="text-xl">{icon}</div>
        <div>
          <div className="font-semibold text-white group-hover:text-peacock-blue">
            {title}
          </div>
          <div className="mt-1 text-sm text-white/60">{desc}</div>
        </div>
      </div>
    </Link>
  );
}
