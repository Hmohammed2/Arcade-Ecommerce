// app/products/[slug]/page.tsx
import type { Metadata } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import ProductPageClient from "./ProductPageClient";
import { fetchProductBySlug } from "@/library/fetchProducts";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }>;
};
/**
 * Dynamic SEO metadata for each product
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

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
      url: `https://arcadesticklabs.co.uk/products/${slug}`,
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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const queryClient = new QueryClient();
  const product = await fetchProductBySlug(slug);

  await queryClient.prefetchQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images?.map((img: any) =>
              typeof img === "string" ? img : img.url
            ),
            description: product.shortDescription || product.description,
            sku: product.sku || product.id,
            brand: {
              "@type": "Brand",
              name: product.brand || "ArcadeStickLabs",
            },
            offers: {
              "@type": "Offer",
              url: `https://arcadesticklabs.co.uk/products/${slug}`,
              priceCurrency: "GBP",
              price: product.price,
              availability: product.in_stock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          }),
        }}
      />
      <HydrationBoundary state={dehydratedState}>
        <div className="dark:bg-gray-900">
          <ProductPageClient slug={slug} />
        </div>
      </HydrationBoundary>
    </>
  );
}
