import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  children,
  onClose,
  maxWidthClass = "max-w-md",
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
            className={`relative w-full ${maxWidthClass} rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-bold text-white">{title}</div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
