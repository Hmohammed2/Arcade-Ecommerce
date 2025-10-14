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
  const { slug } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="dark:bg-gray-900">
        <ProductPageClient slug={slug} />
      </div>
    </HydrationBoundary>
  );
}
