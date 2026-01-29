import type { Metadata } from "next";
import Script from "next/script";
import ArticleClient from "./ArticleClient";
import { fetchArticleBySlug } from "@/library/fetchArticles";

interface ArticlePageProps {
  params: { slug: string };
}

/* -----------------------------------
   Dynamic SEO Metadata
----------------------------------- */
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found | ArcadeStickLabs",
      robots: { index: false, follow: false },
    };
  }

  const url = `https://arcadesticklabs.co.uk/resources/articles/${article.slug}`;
  const image = article.thumbnail
    ? `https://arcadesticklabs.co.uk${article.thumbnail}`
    : "https://arcadesticklabs.co.uk/og-default.jpg";

  return {
    title: `${article.title} | ArcadeStickLabs`,
    description: article.excerpt || article.title,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      url,
      siteName: "ArcadeStickLabs",
      images: [{ url: image }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || article.title,
      images: [image],
    },
  };
}

/* -----------------------------------
   Page (single fetch, JSON-LD here)
----------------------------------- */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-red-500">Article not found</p>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.thumbnail
      ? `https://arcadesticklabs.co.uk${article.thumbnail}`
      : "https://arcadesticklabs.co.uk/og-default.jpg",
    author: {
      "@type": "Person",
      name: article.author_name ?? "ArcadeStickLabs",
    },
    publisher: {
      "@type": "Organization",
      name: "ArcadeStickLabs",
      logo: {
        "@type": "ImageObject",
        url: "https://arcadesticklabs.co.uk/logo.png",
      },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://arcadesticklabs.co.uk/resources/articles/${article.slug}`,
    },
  };

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleClient article={article} />
    </>
  );
}
