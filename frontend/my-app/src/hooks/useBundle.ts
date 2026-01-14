"use client";

import { fetchBundles } from "@/library/fetchProducts";
import { useQuery } from "@tanstack/react-query";

export function useBundles() {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: fetchBundles,
    // ✅ Add these to prevent “bundle not found” flicker
    refetchOnWindowFocus: false, // don’t refetch when tab regains focus
    refetchOnReconnect: false, // don’t auto-refetch on network reconnect
    retry: 1, // retry only once on failure
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
