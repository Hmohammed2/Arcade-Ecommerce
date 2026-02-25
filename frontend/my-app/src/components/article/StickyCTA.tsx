"use client";

import { useEffect, useState } from "react";

interface StickyCTAProps {
  label: string;
  href: string;
}

export default function StickyCTA({ label, href }: StickyCTAProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.5;

      if (window.scrollY > triggerPoint) {
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t border-gray-200 dark:border-gray-700
        bg-white/95 dark:bg-gray-900/95 backdrop-blur
        shadow-lg
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Text */}
          <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
            Ready to upgrade your setup?
          </div>

          {/* Button */}
          <a
            onClick={() => {
              window.gtag?.("event", "sticky_cta_click", {
                event_category: "engagement",
                event_label: label,
              });
            }}
            href={href}
            className="
              w-full sm:w-auto
              text-center
              rounded-xl
              bg-pink-600 hover:bg-pink-700
              text-white font-semibold
              px-5 py-3 sm:py-2.5
              transition
            "
          >
            {label} →
          </a>
        </div>

        {/* Dismiss (mobile only feel) */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss CTA"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
