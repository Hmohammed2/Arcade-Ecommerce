// app/products/[slug]/page.tsx
import type { Metadata } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import ProductPageClient from "./ProductPageClient";
import { fetchProductBySlug } from "@/library/fetchProducts";

/**
 * Dynamic SEO metadata for each product
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | ArcadeStickLabs",
      description: "The requested product could not be found.",
    };
  }

  const title = `${product.name} | ArcadeStickLabs`;
  // ✅ Only use the FIRST image, safely resolved to a string
  const firstImage =
    typeof product.images?.[0] === "string"
      ? product.images[0]
      : product.images?.[0]?.url;
  const description =
    product.shortDescription ||
    product.description ||
    `View details, specifications, and availability for ${product.name} on ArcadeStickLabs.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://arcadesticklabs.co.uk/products/${params.slug}`,
      siteName: "ArcadeStickLabs",
      type: "website",
      images: firstImage
        ? [
            {
              url: firstImage,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images?.[0],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
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
