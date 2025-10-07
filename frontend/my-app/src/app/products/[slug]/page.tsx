// app/products/[slug]/page.tsx
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import ProductPageClient from "./ProductPageClient";
import { fetchProductBySlug } from "@/library/fetchProducts";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["product", params.slug],
    queryFn: () => fetchProductBySlug(params.slug),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProductPageClient slug={params.slug} />
    </HydrationBoundary>
  );
}
