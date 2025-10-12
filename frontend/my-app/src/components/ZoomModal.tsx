"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function ZoomModal({
  src,
  alt,
  trigger,
  closeOnBackdrop = true,
}: {
  src: string;
  alt: string;
  trigger: (open: () => void) => React.ReactNode;
  closeOnBackdrop?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Esc to close + lock scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setScale(1);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleBackdrop = () => {
    if (closeOnBackdrop) {
      setOpen(false);
      setScale(1);
    }
  };

  const toggleZoom = () => setScale((s) => (s === 1 ? 2 : 1));

  return (
    <>
      {trigger(() => setOpen(true))}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdrop} // ✅ click outside closes
          >
            {/* Modal content wrapper (stops propagation) */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Zoomable / draggable image box */}
              <motion.div
                className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-lg bg-black"
                onDoubleClick={toggleZoom}
                drag
                dragMomentum={false}
                dragElastic={0.2}
              >
                <motion.div
                  className="relative w-full h-[70vh] sm:h-[80vh]"
                  animate={{ scale }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain select-none pointer-events-none"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
