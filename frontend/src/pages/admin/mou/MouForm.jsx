import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { adminCreateMou, adminGetMou, adminUpdateMou } from "../../../services/mouApi";
import { resolveAssetUrl } from "../../../utils/apiConfig";

export default function MouForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [serverPreview, setServerPreview] = useState("");
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ show: false, message: "", type }),
      2200
    );
  };

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const res = await adminGetMou(id);
        const row = res?.data?.data;
        const filePreview = resolveAssetUrl(row?.imageUrl || "");
        setServerPreview(filePreview);
        setPreview(filePreview);
      } catch (error) {
        showToast(error?.response?.data?.message || "Failed to load MoU image", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setPreview(isEdit ? serverPreview : "");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !imageFile) {
      showToast("Image is required", "error");
      return;
    }

    if (isEdit && !imageFile) {
      showToast("Select a new image to update", "error");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);

      if (isEdit) {
        await adminUpdateMou(id, fd);
      } else {
        await adminCreateMou(fd);
      }

      showToast(isEdit ? "MoU image updated" : "MoU image created");
      navigate("/admin/mou", { replace: true });
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to save MoU image", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
          <div className="h-72 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-72 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {isEdit ? "Edit MoU Image" : "Add MoU Image"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Upload partner logo image. This section is shown below feedback on Home page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85 hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
            Upload only image. No title or description required.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500/85 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save MoU Image"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Image</h2>
            {(imageFile || preview) && (
              <button
                type="button"
                onClick={clearImageSelection}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          <div className="mt-4">
            {preview ? (
              <img
                src={preview}
                alt="MoU preview"
                className="h-56 w-full rounded-2xl object-contain border border-white/10 bg-white/90 p-3"
              />
            ) : (
              <div className="h-56 w-full rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/10">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-white/70">No image selected</div>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={onPickImage}
            className="mt-4 w-full text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/15"
          />

          <p className="mt-3 text-xs text-white/45">
            JPG, PNG, WEBP, HEIC, HEIF, AVIF. Max size 4MB.
          </p>
        </div>
      </form>
    </div>
  );
}
