"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/library/fetchProducts";
import type { Product } from "@/types/product";

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    // ✅ Add these to prevent “product not found” flicker
    refetchOnWindowFocus: false, // don’t refetch when tab regains focus
    refetchOnReconnect: false, // don’t auto-refetch on network reconnect
    retry: 1, // retry only once on failure
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
