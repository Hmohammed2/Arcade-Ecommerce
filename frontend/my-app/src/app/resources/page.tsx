import type { Metadata } from "next";
import VideosClient from "./VideoClient";
import ArticlesSection from "./ArticleSection";
import { videos } from "./videos";
import Breadcrumbs from "@/components/BreadCrumb";
import ResourcesTabs from "./ResourceTabs";

export const metadata: Metadata = {
  title: "Resources | Fightstick Guides & Tutorials",
  description:
    "Curated fightstick resources from ArcadeStickLabs, including YouTube guides and upcoming in-depth articles.",
  openGraph: {
    title: "Fightstick Resources & Guides",
    description:
      "Learn fightsticks through curated YouTube guides and future written tutorials.",
    url: "https://arcadesticklabs.co.uk/resources",
    siteName: "ArcadeStickLabs",
    type: "website",
  },
};

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      />
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Resources</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A growing collection of fightstick guides, tutorials, and learning
          resources from ArcadeStickLabs.
        </p>
      </header>
      {/* Resource Tabs */}
      <ResourcesTabs />

      {/* SEO: VideoObject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: videos.map((video, index) => ({
              "@type": "VideoObject",
              position: index + 1,
              name: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnail,
              contentUrl: video.url,
              publisher: {
                "@type": "Organization",
                name: "ArcadeStickLabs",
                url: "https://arcadesticklabs.co.uk",
              },
            })),
          }),
        }}
      />
    </main>
  );
}
