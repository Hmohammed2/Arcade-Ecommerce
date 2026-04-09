"use client";

import { useEffect } from "react";
import { readStoredConsent } from "@/library/consent";
import Hotjar from "@hotjar/browser";

const HOTJAR_SITE_ID = Number(process.env.NEXT_PUBLIC_HOTJAR_ID);
const HOTJAR_VERSION = 6;

export default function HotjarProvider() {
  useEffect(() => {
    const init = () => {
      const consent = readStoredConsent();
      const allowed = consent?.analytics === "granted";

      if (!allowed) return;
      if (!HOTJAR_SITE_ID) return;

      Hotjar.init(HOTJAR_SITE_ID, HOTJAR_VERSION);
    };

    init();
    window.addEventListener("cookie-consent-updated", init);

    return () => {
      window.removeEventListener("cookie-consent-updated", init);
    };
  }, []);

  return null;
}
