import { useEffect, useState } from "react";
import { createFeedback, deleteFeedback, listFeedback, updateFeedback } from "../../../services/feedbackApi";

export default function Feedback() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    phone: "",
    name: "",
    course: "",
    feedback: "",
    company: "",
    status: "NEW",
  });

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

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    await createFeedback(form);
    setForm({ phone: "", name: "", course: "", feedback: "", company: "", status: "NEW" });
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete feedback?")) return;
    await deleteFeedback(id);
    load();
  };

  const onChangeStatus = async (id, status) => {
    await updateFeedback(id, { status });
    load();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-peacock-navy">Feedback</h1>
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl border border-peacock-border bg-peacock-bg font-semibold text-peacock-navy"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Add Feedback */}
      <form onSubmit={onSubmit} className="mt-4 bg-white rounded-2xl border border-peacock-border p-6">
        <h2 className="font-semibold text-peacock-navy">Add Feedback</h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded-xl p-3" name="name" value={form.name} onChange={onChange} placeholder="Student Name" required />
          <input className="border rounded-xl p-3" name="phone" value={form.phone} onChange={onChange} placeholder="Phone" required />

          <input className="border rounded-xl p-3" name="course" value={form.course} onChange={onChange} placeholder="Course (ex: Full Stack)" />
          <input className="border rounded-xl p-3" name="company" value={form.company} onChange={onChange} placeholder="Company (Placement)" />

          <select className="border rounded-xl p-3" name="status" value={form.status} onChange={onChange}>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="PLACED">PLACED</option>
          </select>
        </div>

        <textarea
          className="mt-3 border rounded-xl p-3 w-full"
          name="feedback"
          value={form.feedback}
          onChange={onChange}
          placeholder="Feedback message..."
          rows={3}
          required
        />

        <button className="mt-4 px-5 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90">
          Save Feedback
        </button>
      </form>

      {/* List */}
      <div className="mt-5 bg-white rounded-2xl border border-peacock-border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Feedback</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t align-top">
                <td className="p-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</td>
                <td className="p-3 font-semibold text-peacock-navy">{r.name}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.course || "-"}</td>
                <td className="p-3 max-w-[320px]">{r.feedback}</td>
                <td className="p-3">{r.company || "-"}</td>

                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => onChangeStatus(r._id, e.target.value)}
                    className="border rounded-xl p-2"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="PLACED">PLACED</option>
                  </select>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => onDelete(r._id)}
                    className="text-red-600 font-semibold underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="8" className="p-5 text-center text-gray-500">
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
