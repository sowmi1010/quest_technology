import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetCourses } from "../../../services/courseApi";
import { RefreshCcw, Search, Filter, Plus, Pencil } from "lucide-react";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

function money(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "-";
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function CourseList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [publicFilter, setPublicFilter] = useState("all"); // all | yes | no
  const [sortBy, setSortBy] = useState("latest"); // latest | fee | title

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetCourses();
      setRows(res?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = !q
      ? rows
      : rows.filter((c) => {
          const title = String(c.title || "");
          const cat = String(c.categoryId?.name || "");
          return `${title} ${cat}`.toLowerCase().includes(q);
        });

    if (publicFilter !== "all") {
      const want = publicFilter === "yes";
      list = list.filter((c) => !!c.isPublic === want);
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "title") return String(a.title || "").localeCompare(String(b.title || ""));
      if (sortBy === "fee") return (Number(b.totalFee) || 0) - (Number(a.totalFee) || 0);
      // latest: prefer createdAt, fallback to _id
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      if (da !== db) return db - da;
      return String(b._id || "").localeCompare(String(a._id || ""));
    });

    return list;
  }, [rows, query, publicFilter, sortBy]);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Courses</h1>
          <p className="mt-1 text-sm text-white/60">
            Manage course details, pricing and public visibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98]"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </button>

          <Link
            to="/admin/courses/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add Course
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search course title / category..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <select
              value={publicFilter}
              onChange={(e) => setPublicFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 pl-12 pr-10 py-3 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40"
            >
              <option value="all">Public: All</option>
              <option value="yes">Public: Yes</option>
              <option value="no">Public: No</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                       focus:ring-2 focus:ring-sky-400/40"
          >
            <option value="latest">Sort: Latest</option>
            <option value="fee">Sort: Fee (high → low)</option>
            <option value="title">Sort: Title (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6">
            <div className="h-5 w-52 rounded bg-white/10 animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Image</th>
                  <th className="p-4 text-left font-semibold text-white/70">Title</th>
                  <th className="p-4 text-left font-semibold text-white/70">Category</th>
                  <th className="p-4 text-left font-semibold text-white/70">Duration</th>
                  <th className="p-4 text-left font-semibold text-white/70">Fee</th>
                  <th className="p-4 text-left font-semibold text-white/70">Public</th>
                  <th className="p-4 text-left font-semibold text-white/70">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4">
                      {c.imageUrl ? (
                        <img
                          src={`${API_URL}${c.imageUrl}`}
                          alt={c.title}
                          className="h-10 w-16 object-cover rounded-2xl border border-white/10"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-16 rounded-2xl bg-white/10 border border-white/10 grid place-items-center text-[11px] text-white/50">
                          No Image
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{c.title}</div>
                      <div className="text-xs text-white/45">{c._id}</div>
                    </td>

                    <td className="p-4">{c.categoryId?.name || "-"}</td>
                    <td className="p-4">{c.duration || "-"}</td>
                    <td className="p-4 font-semibold">{money(c.totalFee)}</td>

                    <td className="p-4">
                      <span
                        className={[
                          "inline-flex min-w-[70px] justify-center rounded-2xl border px-3 py-1.5 text-xs font-bold",
                          c.isPublic
                            ? "border-emerald-200/30 bg-emerald-500/15 text-emerald-200"
                            : "border-rose-200/30 bg-rose-500/15 text-rose-200",
                        ].join(" ")}
                      >
                        {c.isPublic ? "YES" : "NO"}
                      </span>
                    </td>

                    <td className="p-4">
                      <Link
                        to={`/admin/courses/${c._id}/edit`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/85
                                   hover:bg-white/10 transition active:scale-[0.98]"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-white/60">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-white/40">
        Note: Category name shows only if you saved categoryId properly.
      </div>
    </div>
  );
}
