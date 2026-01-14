import { fetchBundleBySlug } from "@/library/fetchProducts";
import BundlePageClient from "./BundleClient";
import type { Metadata } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await fetchBundleBySlug(slug);

  return {
    title: `${bundle.name} – ArcadeStickLabs UK`,
    description:
      bundle.short_description ||
      `Buy the ${bundle.name} arcade mod kit in the UK.`,
    openGraph: {
      title: bundle.name,
      description:
        bundle.short_description || `Buy the ${bundle.name} mod kit in the UK.`,
      images: bundle.image ? [{ url: bundle.image }] : [],
    },
  };
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  const queryClient = new QueryClient();
  // ✅ Prefetch bundle data server-side
  await queryClient.prefetchQuery({
    queryKey: ["bundle", slug],
    queryFn: () => fetchBundleBySlug(slug),
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationBoundary state={dehydratedState}>
        <div className="dark:bg-gray-900 bg-white min-h-screen py-8">
          <BundlePageClient slug={slug} />
        </div>
      </HydrationBoundary>
    </>
  );
}
