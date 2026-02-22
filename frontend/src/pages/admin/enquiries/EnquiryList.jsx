import { useEffect, useMemo, useState } from "react";
import { getEnquiries } from "../../../services/enquiryApi";
import { Search, Filter, Phone, RefreshCcw } from "lucide-react";

function fmtDate(d) {
  try {
    return d ? new Date(d).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("new")) return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (s.includes("follow")) return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  if (s.includes("joined") || s.includes("admit"))
    return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  if (s.includes("not") || s.includes("drop") || s.includes("cancel"))
    return "border-rose-200/30 bg-rose-500/15 text-rose-200";
  return "border-white/10 bg-white/5 text-white/80";
}

export default function EnquiryList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getEnquiries();
      setRows(res?.data?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const uniqueStatuses = useMemo(() => {
    const set = new Set(rows.map((r) => String(r.status || "").trim()).filter(Boolean));
    return Array.from(set);
  }, [rows]);

  const uniqueBatches = useMemo(() => {
    const set = new Set(rows.map((r) => String(r.preferredBatch || "").trim()).filter(Boolean));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = !q
      ? rows
      : rows.filter((r) => {
          const line = `${r.name || ""} ${r.phone || ""} ${r.course || ""} ${r.category || ""}`.toLowerCase();
          return line.includes(q);
        });

    if (statusFilter !== "all") {
      list = list.filter((r) => String(r.status || "") === statusFilter);
    }

    if (batchFilter !== "all") {
      list = list.filter((r) => String(r.preferredBatch || "") === batchFilter);
    }

    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortBy === "latest" ? db - da : da - db;
    });

    return list;
  }, [rows, query, statusFilter, batchFilter, sortBy]);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Enquiries</h1>
          <p className="mt-1 text-sm text-white/60">
            Track all enquiries and follow-up status.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                     hover:bg-white/10 transition active:scale-[0.98]"
        >
          <RefreshCcw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_180px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name / phone / course..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 pl-12 pr-10 py-3 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
            >
              <option value="all">Status: All</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                       focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
          >
            <option value="all">Batch: All</option>
            {uniqueBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                       focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6">
            <div className="h-5 w-44 rounded bg-white/10 animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Date</th>
                  <th className="p-4 text-left font-semibold text-white/70">Name</th>
                  <th className="p-4 text-left font-semibold text-white/70">Phone</th>
                  <th className="p-4 text-left font-semibold text-white/70">Category</th>
                  <th className="p-4 text-left font-semibold text-white/70">Course</th>
                  <th className="p-4 text-left font-semibold text-white/70">Batch</th>
                  <th className="p-4 text-left font-semibold text-white/70">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4 text-white/80">{fmtDate(r.createdAt)}</td>

                    <td className="p-4">
                      <div className="font-bold text-white">{r.name || "-"}</div>
                      <div className="text-xs text-white/45">{r._id}</div>
                    </td>

                    <td className="p-4">
                      {r.phone ? (
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/85
                                     hover:bg-white/10 transition"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                          {r.phone}
                        </a>
                      ) : (
                        <span className="text-white/50">-</span>
                      )}
                    </td>

                    <td className="p-4">{r.category || "-"}</td>
                    <td className="p-4">{r.course || "-"}</td>
                    <td className="p-4">{r.preferredBatch || "-"}</td>

                    <td className="p-4">
                      <span
                        className={[
                          "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold",
                          statusPill(r.status),
                        ].join(" ")}
                      >
                        {r.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-white/60" colSpan="7">
                      No enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
