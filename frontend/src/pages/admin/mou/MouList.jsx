import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { adminDeleteMou, adminListMou } from "../../../services/mouApi";
import { getPublicImageUrl } from "../../../utils/publicUi";

function fmtDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default function MouList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const res = await adminListMou();
      setRows(res?.data?.data || []);
    } catch (error) {
      setRows([]);
      showToast(error?.response?.data?.message || "Failed to load MoU images", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this MoU image?");
    if (!ok) return;

    try {
      await adminDeleteMou(id);
      showToast("MoU image deleted");
      await load();
    } catch (error) {
      showToast(error?.response?.data?.message || "Delete failed", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">MoU Highlights</h1>
          <p className="mt-1 text-sm text-white/60">
            Upload partner logo images shown on the Home page under feedback.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </button>

          <Link
            to="/admin/mou/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110"
          >
            <Plus className="h-5 w-5" />
            Add MoU Image
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-56 rounded-3xl bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <article
              key={row._id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <div className="h-44 bg-white/90 p-3">
                <img
                  src={getPublicImageUrl(row.imageUrl)}
                  alt="MoU partner"
                  className="h-full w-full rounded-2xl object-contain"
                  loading="lazy"
                />
              </div>

              <div className="p-4">
                <div className="text-xs text-white/45">Uploaded: {fmtDate(row.createdAt)}</div>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/admin/mou/${row._id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/85 hover:bg-white/10 transition"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDelete(row._id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-200 hover:bg-rose-500/15 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {rows.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No MoU images found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
