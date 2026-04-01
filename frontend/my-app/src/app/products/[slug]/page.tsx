import type { Metadata } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import ProductPageClient from "./ProductPageClient";
import { fetchProductBySlug } from "@/library/fetchProducts";
import Script from "next/script";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

function stripHtml(html?: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

function getProductTypeLabel(product: any) {
  const category =
    `${product?.category || ""} ${product?.productType || ""}`.toLowerCase();
  const name = `${product?.name || ""}`.toLowerCase();

  if (category.includes("button") || name.includes("button"))
    return "Arcade Button";
  if (category.includes("lever") || name.includes("lever"))
    return "Arcade Lever";
  if (category.includes("ball top") || name.includes("ball top"))
    return "Ball Top";
  if (category.includes("bat top") || name.includes("bat top"))
    return "Bat Top";
  return "Arcade Part";
}

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

  const firstImage =
    typeof product.images?.[0] === "string"
      ? product.images[0]
      : product.images?.[0]?.url;

  const productTypeLabel = getProductTypeLabel(product);

  const rawDescription =
    product.shortDescription ||
    stripHtml(product.description) ||
    `Shop ${product.name} at ArcadeStickLabs. Genuine arcade parts for fight sticks, custom builds, and upgrades in the UK.`;

  const description = truncate(rawDescription, 155);

  const title = `${product.name} ${productTypeLabel} UK | ArcadeStickLabs`;
  const url = `https://arcadesticklabs.co.uk/products/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
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
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const queryClient = new QueryClient();
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const dehydratedState = dehydrate(queryClient);

  const productImages = product.images?.map((img: any) =>
    typeof img === "string" ? img : img.url,
  );

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
            url: `https://arcadesticklabs.co.uk/products/${slug}`,
            image: productImages,
            description:
              stripHtml(product.shortDescription) ||
              stripHtml(product.description),
            sku: product.sku || product.id,
            category: product.category || undefined,
            brand: {
              "@type": "Brand",
              name: product.brand || "ArcadeStickLabs",
            },
            seller: {
              "@type": "Organization",
              name: "ArcadeStickLabs",
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
