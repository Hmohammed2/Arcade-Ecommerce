"use client";

import { useEffect, useState } from "react";
import {
  applyConsent,
  readStoredConsent,
  saveConsent,
} from "@/library/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readStoredConsent();
    if (!existing) {
      setVisible(true);
      return;
    }

    applyConsent(existing.analytics);
  }, []);

  const acceptAnalytics = () => {
    const consent = {
      analytics: "granted" as const,
      updatedAt: new Date().toISOString(),
    };

    saveConsent(consent);
    applyConsent("granted");
    setVisible(false);

    window.dispatchEvent(new Event("cookie-consent-updated"));
  };

  const rejectAnalytics = () => {
    const consent = {
      analytics: "denied" as const,
      updatedAt: new Date().toISOString(),
    };

    saveConsent(consent);
    applyConsent("denied");
    setVisible(false);

    window.dispatchEvent(new Event("cookie-consent-updated"));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t bg-white p-4 shadow-2xl dark:bg-neutral-950 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold">Cookies & analytics</p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            We use analytics cookies to understand site usage and improve the
            experience. You can accept or reject non-essential tracking.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={rejectAnalytics}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Reject
          </button>
          <button
            onClick={acceptAnalytics}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
