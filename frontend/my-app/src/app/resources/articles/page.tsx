export const dynamic = "force-dynamic";
export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { fetchArticles } from "@/library/fetchArticles";
import { getImageUrl } from "@/library/getImageUrl";
import Breadcrumbs from "@/components/BreadCrumb";

const pageUrl = "https://arcadesticklabs.co.uk/resources/articles";

export const metadata: Metadata = {
  title: "Fightstick Modding Guides & Arcade Stick Articles | ArcadeStickLabs",
  description:
    "In-depth written guides covering Sanwa, Seimitsu, Brook boards, Korean levers, and competitive fightstick optimisation.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title:
      "Fightstick Modding Guides & Arcade Stick Articles | ArcadeStickLabs",
    description:
      "In-depth written guides covering Sanwa, Seimitsu, Brook boards, Korean levers, and competitive fightstick optimisation.",
    url: pageUrl,
    siteName: "ArcadeStickLabs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Fightstick Modding Guides & Arcade Stick Articles | ArcadeStickLabs",
    description:
      "In-depth written guides covering Sanwa, Seimitsu, Brook boards, Korean levers, and competitive fightstick optimisation.",
  },
};

function estimateReadingTime(text?: string) {
  if (!text) return "2 min read";

  const plainText = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[#_*`>\-\[\]\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = plainText.split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return `${minutes} min read`;
}

export default async function ArticlesIndexPage() {
  const articles = await fetchArticles();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Fightstick Modding Guides & Arcade Stick Articles",
    url: pageUrl,
    description:
      "In-depth written guides covering Sanwa, Seimitsu, Brook boards, Korean levers, and competitive fightstick optimisation.",
    mainEntity: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `${pageUrl}/${article.slug}`,
      datePublished: article.published_at,
      description: article.excerpt || undefined,
      author: {
        "@type": "Organization",
        name: article.author_name || "ArcadeStickLabs",
      },
      image: article.thumbnail ? getImageUrl(article.thumbnail) : undefined,
    })),
  };

  return (
    <>
      <Script
        id="articles-index-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <section>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Resources", href: "/resources" },
                { label: "Articles" },
              ]}
            />

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Articles & Written Guides ({articles.length})
              </h1>

              <p className="mt-3 text-gray-600 dark:text-gray-400">
                In-depth written guides on fightstick builds, modding, and
                competitive optimisation.
              </p>
            </div>

            {articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/resources/articles/${article.slug}`}
                    className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-pink-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    {article.thumbnail && (
                      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={getImageUrl(article.thumbnail)}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString(
                              "en-GB",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "Draft"}{" "}
                        • {estimateReadingTime(article.content)}
                      </div>

                      <h2 className="font-semibold text-gray-900 transition-colors group-hover:text-pink-600 dark:text-gray-100">
                        {article.title}
                      </h2>

                      {article.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {article.excerpt}
                        </p>
                      )}

                      <span className="mt-2 text-sm font-medium text-pink-600">
                        Read article →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🚧 Articles are currently in progress. Check back soon.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
