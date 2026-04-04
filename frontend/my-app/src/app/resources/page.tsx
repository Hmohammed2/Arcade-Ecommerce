import type { Metadata } from "next";
import { videos } from "./videos";
import Breadcrumbs from "@/components/BreadCrumb";
import ResourcesTabs from "./ResourceTabs";

export const metadata: Metadata = {
  title: "Resources | Fightstick Guides & Tutorials",
  description:
    "Practical fightstick guides from ArcadeStickLabs to help you choose the right levers, buttons, and upgrades without compatibility mistakes.",
  openGraph: {
    title: "Fightstick Resources & Guides",
    description:
      "Learn how to choose the right fightstick parts, avoid compatibility mistakes, and find the best upgrades for your setup.",
    url: "https://arcadesticklabs.co.uk/resources",
    siteName: "ArcadeStickLabs",
    type: "website",
  },
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        />

        <header className="mb-10 dark:text-gray-100">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-pink-600 dark:text-pink-400">
              ArcadeStickLabs Resources
            </p>

            <h1 className="mt-3 text-4xl font-bold  sm:text-5xl">
              Learn what to buy before you buy it
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Practical guides for choosing levers, buttons, and upgrades
              without wasting money on the wrong parts or running into
              compatibility issues.
            </p>
          </div>
        </header>

        <ResourcesTabs />

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
