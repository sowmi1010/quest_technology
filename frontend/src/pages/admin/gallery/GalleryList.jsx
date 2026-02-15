import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Pencil, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { adminDeleteGallery, adminListGallery } from "../../../services/galleryApi";
import { GALLERY_CATEGORY_OPTIONS, getGalleryCategoryLabel } from "../../../utils/galleryCategories";
import { getPublicImageUrl } from "../../../utils/publicUi";

function fmtDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default function GalleryList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
      const res = await adminListGallery();
      setRows(res?.data?.data || []);
    } catch (error) {
      setRows([]);
      showToast(error?.response?.data?.message || "Failed to load gallery", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      const categoryMatch = categoryFilter === "all" || row.category === categoryFilter;
      if (!categoryMatch) return false;

      if (!q) return true;
      const line = `${row.title || ""} ${row.description || ""} ${getGalleryCategoryLabel(row.category)}`.toLowerCase();
      return line.includes(q);
    });
  }, [categoryFilter, query, rows]);

  const onDelete = async (id, title) => {
    const ok = window.confirm(`Delete this gallery item${title ? `: ${title}` : ""}?`);
    if (!ok) return;

    try {
      await adminDeleteGallery(id);
      showToast("Gallery item deleted");
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-white/60">
            Upload and manage public gallery photos by category.
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
            to="/admin/gallery/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110"
          >
            <Plus className="h-5 w-5" />
            Add Photo
          </Link>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_280px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title / description..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 pl-12 pr-10 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400/40 [&>option]:bg-white [&>option]:text-slate-900"
            >
              <option value="all">All Categories</option>
              {GALLERY_CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-72 rounded-3xl bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <article
              key={row._id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <div className="relative h-52 overflow-hidden">
                {row.imageUrl ? (
                  <img
                    src={getPublicImageUrl(row.imageUrl)}
                    alt={row.title || "Gallery upload"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-white/10" />
                )}

                <div className="absolute left-3 top-3 rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11px] font-bold text-white">
                  {getGalleryCategoryLabel(row.category)}
                </div>

                <div
                  className={[
                    "absolute right-3 top-3 rounded-full border px-3 py-1 text-[11px] font-bold",
                    row.isPublic
                      ? "border-emerald-200/35 bg-emerald-500/20 text-emerald-100"
                      : "border-amber-200/30 bg-amber-500/20 text-amber-100",
                  ].join(" ")}
                >
                  {row.isPublic ? "Public" : "Hidden"}
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-base font-bold text-white">
                  {row.title?.trim() ? row.title : "Untitled Upload"}
                </h2>

                {row.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/65 max-h-16 overflow-hidden">
                    {row.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-white/45">No description</p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                  <span>Uploaded: {fmtDate(row.createdAt)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/admin/gallery/${row._id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/85 hover:bg-white/10 transition"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDelete(row._id, row.title)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-200 hover:bg-rose-500/15 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No gallery uploads found for this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
