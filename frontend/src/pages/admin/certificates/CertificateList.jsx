import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminListCertificates } from "../../../services/certificateApi";
import { FileText, Search, Copy, Check } from "lucide-react";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

function formatDate(d) {
  try {
    return d ? new Date(d).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

export default function CertificateList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminListCertificates();
        const list = res?.data?.data || [];
        // sort latest first
        list.sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0));
        setRows(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c) => {
      const certNo = String(c.certNo || "");
      const student = String(c.studentId?.name || "");
      const course = String(c.courseId?.title || "");
      return `${certNo} ${student} ${course}`.toLowerCase().includes(q);
    });
  }, [rows, query]);

  const onCopy = async (certNo) => {
    try {
      await navigator.clipboard.writeText(String(certNo));
      setCopiedId(String(certNo));
      window.setTimeout(() => setCopiedId(""), 1200);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Certificates</h1>
          <p className="mt-1 text-sm text-white/60">
            View issued certificates and download PDFs.
          </p>
        </div>

        <Link
          to="/admin/certificates/issue"
          className="inline-flex items-center justify-center rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                     shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                     transition hover:brightness-110 active:scale-[0.98]"
        >
          + Generate Certificate
        </Link>
      </div>

      {/* Search */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cert no / student / course..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                       focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="p-6">
            <div className="h-5 w-56 rounded bg-white/10 mb-4 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm text-white/85">
              <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold text-white/70">Cert No</th>
                  <th className="p-4 text-left font-semibold text-white/70">Student</th>
                  <th className="p-4 text-left font-semibold text-white/70">Course</th>
                  <th className="p-4 text-left font-semibold text-white/70">Issued</th>
                  <th className="p-4 text-left font-semibold text-white/70">PDF</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.certNo}</span>
                        <button
                          type="button"
                          onClick={() => onCopy(c.certNo)}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
                          title="Copy certificate number"
                        >
                          {copiedId === String(c.certNo) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-white/50">{c._id}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {c.studentId?.name || "-"}
                      </div>
                      <div className="text-xs text-white/50">
                        {c.studentId?.studentId || ""}
                      </div>
                    </td>

                    <td className="p-4">{c.courseId?.title || "-"}</td>

                    <td className="p-4 text-white/80">{formatDate(c.issueDate)}</td>

                    <td className="p-4">
                      {c.pdfUrl ? (
                        <a
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-white/85
                                     hover:bg-white/10 transition"
                          href={`${API_URL}${c.pdfUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText className="h-5 w-5" />
                          Open PDF
                        </a>
                      ) : (
                        <span className="text-white/50">-</span>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-white/60">
                      No certificates found.
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
