import type { Metadata } from "next";
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
    <main className="min-h-screen dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        />
        {/* Header */}
        <header className="mb-12 dark:text-gray-100">
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
        {/* Disclaimer */}
        <footer className="mt-20 border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <strong>Disclaimer:</strong> ArcadeStickLabs curates and links to
            third-party resources for educational purposes. We do not claim
            ownership of external video or article content, and all rights
            remain with their respective creators. Views expressed in linked
            resources are those of the original authors and do not necessarily
            reflect the views of ArcadeStickLabs.
          </p>
        </footer>
      </div>
    </main>
  );
}
