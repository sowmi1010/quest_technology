import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteFeedback, listFeedback, updateFeedback } from "../../../services/feedbackApi";

export default function FeedbackList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listFeedback();
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this feedback?")) return;
    await deleteFeedback(id);
    load();
  };

  const onStatusChange = async (id, status) => {
    await updateFeedback(id, { status });
    load();
  };

  const stars = (rating = 0) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return "★".repeat(r) + "☆".repeat(5 - r);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-peacock-navy">Feedback</h1>
          <p className="text-sm text-gray-600 mt-1">Manage student feedback & placements.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-peacock-border bg-peacock-bg font-semibold text-peacock-navy"
          >
            🔄 Refresh
          </button>

          <Link
            to="/admin/feedback/new"
            className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
          >
            + Add Feedback
          </Link>
        </div>
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-peacock-border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Feedback</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t align-top">
                <td className="p-3">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}
                </td>

                <td className="p-3">
                  {r.imageUrl ? (
                    <img
                      src={`http://localhost:5000${r.imageUrl}`}
                      alt={r.name}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-peacock-bg border border-peacock-border flex items-center justify-center text-xs text-gray-500">
                      No
                    </div>
                  )}
                </td>

                <td className="p-3 font-semibold text-peacock-navy">{r.name}</td>
                <td className="p-3">{r.course || "-"}</td>

                <td className="p-3">
                  <span className="px-2 py-1 rounded-lg border bg-peacock-bg border-peacock-border font-semibold text-peacock-navy">
                    {stars(r.rating)}
                  </span>
                </td>

                <td className="p-3 max-w-[320px]">{r.feedback}</td>
                <td className="p-3">{r.company || "-"}</td>

                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r._id, e.target.value)}
                    className="border rounded-xl p-2 bg-white"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="PLACED">PLACED</option>
                  </select>
                </td>

                <td className="p-3">
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/feedback/${r._id}`}
                      className="text-peacock-blue font-semibold underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(r._id)}
                      className="text-red-600 font-semibold underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="9" className="p-5 text-center text-gray-500">
                  No feedback yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
