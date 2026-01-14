import type { Metadata } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { fetchProducts, fetchBundles } from "@/library/fetchProducts";
import ShopPage from "./ShopPage";

export const metadata: Metadata = {
  title: "Shop Arcade Parts UK — ArcadeStickLabs",
  description:
    "Buy curated arcade parts and fightstick kits in the UK. Fast UK shipping with premium Sanwa, Seimitsu, and Brook components.",
};

export default async function ShopPageWrapper() {
  const queryClient = new QueryClient();

  // ✅ Prefetch data server-side
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  await queryClient.prefetchQuery({
    queryKey: ["bundles"],
    queryFn: fetchBundles,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    // ✅ Pass the prefetched data to the client
    <HydrationBoundary state={dehydratedState}>
      <ShopPage />
    </HydrationBoundary>
  );
}
