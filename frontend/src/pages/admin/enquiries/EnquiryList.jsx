import { useEffect, useState } from "react";
import { getEnquiries } from "../../../services/enquiryApi";

export default function EnquiryList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getEnquiries();
        setRows(res.data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-peacock-navy">Enquiries</h1>

      <div className="mt-4 overflow-auto bg-white rounded-2xl border border-peacock-border">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.category}</td>
                <td className="p-3">{r.course}</td>
                <td className="p-3">{r.preferredBatch}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-lg bg-peacock-bg border border-peacock-border">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="7">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
