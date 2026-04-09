"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem("asl_cookie_consent");
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    return parsed?.analytics === "granted";
  } catch {
    return false;
  }
}

export default function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;
    if (!hasAnalyticsConsent()) return;

    const queryString = searchParams?.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [pathname, searchParams, GA_ID]);

  return null;
}
