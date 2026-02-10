import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminListCertificates } from "../../../services/certificateApi";

export default function CertificateList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminListCertificates();
        setRows(res.data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">Certificates</h1>

        <Link
          to="/admin/certificates/issue"
          className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
        >
          + Generate Certificate
        </Link>
      </div>

      <div className="mt-4 overflow-auto bg-white rounded-2xl border border-peacock-border">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Cert No</th>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Issued</th>
              <th className="p-3 text-left">PDF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-3 font-semibold text-peacock-navy">{c.certNo}</td>
                <td className="p-3">{c.studentId?.name}</td>
                <td className="p-3">{c.courseId?.title}</td>
                <td className="p-3">
                  {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : "-"}
                </td>
                <td className="p-3">
                  <a
                    className="text-peacock-blue font-semibold underline"
                    href={`http://localhost:5000${c.pdfUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No certificates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
