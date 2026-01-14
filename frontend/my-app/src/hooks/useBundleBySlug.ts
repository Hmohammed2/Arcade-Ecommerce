"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBundleBySlug } from "@/library/fetchProducts";
import type { Bundle } from "@/types/bundle";

export function useBundleBySlug(slug: string) {
  return useQuery<Bundle>({
    queryKey: ["bundle", slug],
    queryFn: () => fetchBundleBySlug(slug),
    enabled: !!slug, // only fetch if slug is defined

    // ✅ Add these to prevent “product not found” flicker
    refetchOnWindowFocus: false, // don’t refetch when tab regains focus
    refetchOnReconnect: false, // don’t auto-refetch on network reconnect
    retry: 1, // retry only once on failure
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
