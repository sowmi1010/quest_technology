import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function AdminToast({ show, type = "success", message = "", onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed right-4 top-4 z-50"
          initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
        >
          <div
            className={[
              "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl",
              type === "success"
                ? "border-emerald-200/40 bg-emerald-50/80 text-emerald-900"
                : "border-rose-200/40 bg-rose-50/80 text-rose-900",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div className="text-sm font-semibold">{message}</div>

              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto grid h-8 w-8 place-items-center rounded-xl border border-black/10 bg-black/5 hover:bg-black/10"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
