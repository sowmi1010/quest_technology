import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getEnquiry } from "../../../services/enquiryApi";
import { api } from "../../../services/api";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Save,
  User,
  Tag,
  BookOpen,
  Calendar,
  ClipboardList,
} from "lucide-react";

function fmtDateTime(d) {
  try {
    return d ? new Date(d).toLocaleString() : "-";
  } catch {
    return "-";
  }
}

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("new")) return "border-sky-200/30 bg-sky-500/15 text-sky-200";
  if (s.includes("called")) return "border-amber-200/30 bg-amber-500/15 text-amber-200";
  if (s.includes("interested")) return "border-indigo-200/30 bg-indigo-500/15 text-indigo-200";
  if (s.includes("joined")) return "border-emerald-200/30 bg-emerald-500/15 text-emerald-200";
  if (s.includes("not")) return "border-rose-200/30 bg-rose-500/15 text-rose-200";
  return "border-white/10 bg-white/5 text-white/80";
}

export default function EnquiryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState(null);

  const [status, setStatus] = useState("NEW");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, message: "", type }),
      2200
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getEnquiry(id);
      const data = res?.data?.data;
      setEnquiry(data || null);
      setStatus(data?.status || "NEW");
      setNotes(data?.notes || "");
    } catch (err) {
      setEnquiry(null);
      showToast("Failed to load enquiry", "error");
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
    try {
      await api.patch(`/enquiries/${id}`, { status, notes });
      showToast("Updated successfully", "success");
      await load();
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const createdDate = useMemo(() => fmtDateTime(enquiry?.createdAt), [enquiry?.createdAt]);

  const phoneDigits = useMemo(
    () => String(enquiry?.phone || "").replace(/\D/g, ""),
    [enquiry?.phone]
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-6 w-52 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-80 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-xl font-bold text-white">Enquiry</h1>
          <p className="mt-2 text-sm text-white/60">Not found or failed to load.</p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       transition hover:brightness-110 active:scale-[0.98]"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            className="fixed right-4 top-4 z-50"
          >
            <div
              className={[
                "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl",
                toast.type === "success"
                  ? "border-emerald-200/40 bg-emerald-50/80 text-emerald-900"
                  : "border-rose-200/40 bg-rose-50/80 text-rose-900",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Enquiry Details</h1>
          <p className="mt-1 text-sm text-white/60">
            Submitted: <span className="font-semibold text-white">{createdDate}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85
                       hover:bg-white/10 transition active:scale-[0.98]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <a
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/85 px-4 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(16,185,129,0.65)]
                       transition hover:brightness-110 active:scale-[0.98]"
            href={`tel:${enquiry.phone}`}
          >
            <Phone className="h-5 w-5" />
            Call
          </a>

          <a
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-4 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98]"
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/91${phoneDigits}`}
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">Student Details</h2>
            <span
              className={[
                "inline-flex rounded-2xl border px-3 py-1.5 text-xs font-bold",
                statusPill(enquiry.status),
              ].join(" ")}
            >
              {enquiry.status || "Unknown"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info icon={User} label="Name" value={enquiry.name} />
            <Info icon={Phone} label="Phone" value={enquiry.phone} />
            <Info icon={Tag} label="Category" value={enquiry.category || "-"} />
            <Info icon={BookOpen} label="Course" value={enquiry.course || "-"} />
            <Info icon={Calendar} label="Preferred Batch" value={enquiry.preferredBatch || "-"} />
            <Info icon={ClipboardList} label="Status" value={enquiry.status || "-"} />
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-white/60">Message</div>
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              {enquiry.message?.trim() ? (
                enquiry.message
              ) : (
                <span className="text-white/45">No message</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base font-bold text-white">Admin Actions</h2>

          <div className="mt-4">
            <label className="text-xs font-semibold text-white/60">Status</label>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none
                         focus:ring-2 focus:ring-sky-400/40"
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
            <label className="text-xs font-semibold text-white/60">Notes (internal)</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                         focus:ring-2 focus:ring-sky-400/40"
              rows={6}
              placeholder="Example: Called parent, asked to visit tomorrow..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white
                       shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                       transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            type="button"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/45">
            Tip: After status becomes <b>JOINED</b>, you can convert to student.
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
        <Icon className="h-4 w-4 text-white/45" />
        {label}
      </div>
      <div className="mt-2 font-semibold text-white break-words">{value ?? "-"}</div>
    </div>
  );
}
