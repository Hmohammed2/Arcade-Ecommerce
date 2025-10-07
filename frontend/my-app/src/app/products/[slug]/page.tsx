import type { Metadata } from "next";
import { fetchProductBySlug } from "@/library/fetchProducts"; // API fetcher
import ProductPageClient from ".//ProductPageClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

type Props = {
  params: { slug: string };
};

// ✅ Generate SEO metadata dynamically per product
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await fetchProductBySlug(params.slug);

    if (!product) {
      return {
        title: "Product not found — ArcadeStickLabs",
        description: "The product you are looking for could not be found.",
      };
    }

    return {
      title: `${product.name} — ArcadeStickLabs`, // Django model uses "name", not "title"
      description:
        product.description ||
        `Buy ${product.name} from ArcadeStickLabs. Fast UK shipping, trusted brands.`,
      openGraph: {
        title: product.name,
        description: product.description || product.name,
        type: "product",
        url: `${baseUrl}/products/${product.slug}`,
        images: product.image
          ? [
              {
                url: product.image,
                width: 800,
                height: 600,
                alt: product.name,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description || product.name,
        images: product.image ? [product.image] : [],
      },
    };
  } catch (error) {
    return {
      title: "Product not found — ArcadeStickLabs",
      description: "The product you are looking for could not be found.",
    };
  }
}

// ✅ Server-render wrapper (passes slug to client component)
export default async function ProductPage({ params }: Props) {
  return <ProductPageClient slug={params.slug} />;
}
