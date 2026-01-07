import { fetchArticleBySlug } from "@/library/fetchArticles";
import ArticleClient from "./ArticleClient";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: { slug: string };
}

/* -----------------------------------
   Dynamic SEO Metadata (Next 14+)
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
   Page
----------------------------------- */
export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleClient slug={params.slug} />;
}
