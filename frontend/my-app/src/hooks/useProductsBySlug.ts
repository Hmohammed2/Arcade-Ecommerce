"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/library/fetchProducts";
import type { Product } from "@/types/product";

export function useProductBySlug(slug: string) {
  return useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug, // only fetch if slug is defined

    // ✅ Add these to prevent “product not found” flicker
    refetchOnWindowFocus: false, // don’t refetch when tab regains focus
    refetchOnReconnect: false, // don’t auto-refetch on network reconnect
    retry: 1, // retry only once on failure
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
