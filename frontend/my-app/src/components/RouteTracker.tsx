"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RouteTracker() {
  const pathname = usePathname();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (!window.gtag || !GA_ID) return;
    window.gtag("config", GA_ID, { page_path: pathname });
  }, [pathname]);

  return null;
}
