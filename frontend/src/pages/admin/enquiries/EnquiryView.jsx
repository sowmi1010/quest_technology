import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEnquiry } from "../../../services/enquiryApi";
import { api } from "../../../services/api";

export default function EnquiryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState(null);
  const [status, setStatus] = useState("NEW");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await getEnquiry(id);
      const data = res.data.data;
      setEnquiry(data);
      setStatus(data.status || "NEW");
      setNotes(data.notes || "");
    } catch (err) {
      setMsg("❌ Failed to load enquiry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      await api.patch(`/enquiries/${id}`, { status, notes });
      setMsg("✅ Updated successfully");
      await load();
    } catch (err) {
      setMsg("❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!enquiry) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <h1 className="text-xl font-bold text-peacock-navy">Enquiry</h1>
          <p className="mt-2 text-sm text-gray-600">Not found or failed to load.</p>
          <button
            className="mt-4 px-4 py-2 rounded-xl bg-peacock-blue text-white"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const createdDate = enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : "-";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-peacock-navy">Enquiry Details</h1>
          <p className="text-sm text-gray-600">Submitted: {createdDate}</p>
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-peacock-border bg-white"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <a
            className="px-4 py-2 rounded-xl bg-peacock-green text-white font-semibold hover:opacity-90"
            href={`tel:${enquiry.phone}`}
          >
            Call
          </a>
          <a
            className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/91${String(enquiry.phone).replace(/\D/g, "")}`}
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-peacock-border p-6">
          <h2 className="font-semibold text-peacock-navy">Student Details</h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Info label="Name" value={enquiry.name} />
            <Info label="Phone" value={enquiry.phone} />
            <Info label="Category" value={enquiry.category || "-"} />
            <Info label="Course" value={enquiry.course} />
            <Info label="Preferred Batch" value={enquiry.preferredBatch || "-"} />
            <Info label="Status" value={enquiry.status} />
          </div>

          <div className="mt-5">
            <div className="text-xs text-gray-500">Message</div>
            <div className="mt-1 rounded-xl border border-peacock-border p-3 bg-peacock-bg">
              {enquiry.message?.trim() ? enquiry.message : <span className="text-gray-500">-</span>}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="bg-white rounded-2xl border border-peacock-border p-6">
          <h2 className="font-semibold text-peacock-navy">Admin Actions</h2>

          <div className="mt-4">
            <label className="text-xs text-gray-500">Status</label>
            <select
              className="mt-1 w-full border rounded-xl p-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="NEW">NEW</option>
              <option value="CALLED">CALLED</option>
              <option value="INTERESTED">INTERESTED</option>
              <option value="JOINED">JOINED</option>
              <option value="NOT_INTERESTED">NOT_INTERESTED</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-500">Notes (internal)</label>
            <textarea
              className="mt-1 w-full border rounded-xl p-3"
              rows={5}
              placeholder="Example: Called parent, asked to visit tomorrow..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="mt-4 w-full bg-peacock-blue text-white rounded-xl p-3 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {msg && <div className="mt-3 text-sm font-medium">{msg}</div>}

          <div className="mt-6 border-t pt-4 text-xs text-gray-500">
            Tip: After status becomes <b>JOINED</b>, you can convert to student (we’ll add next).
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-peacock-border p-3 bg-peacock-bg">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-peacock-navy break-words">{value}</div>
    </div>
  );
}
