"use client";

import { useEffect, useState } from "react";
import ArticleLayout from "@/components/article/ArticleLayout";
import Comments from "@/components/article/Comments";
import { fetchArticleBySlug, Article } from "@/library/fetchArticles";

interface ArticleClientProps {
  slug: string;
}

export default function ArticleClient({ slug }: ArticleClientProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchArticleBySlug(slug)
      .then((data) => {
        if (isMounted) setArticle(data);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load article");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /* -----------------------------
     States
  ----------------------------- */

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-red-500">{error ?? "Article not found"}</p>
      </div>
    );
  }

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <ArticleLayout
      title={article.title}
      thumbnail={article.thumbnail ?? "/images/articles/placeholder.jpg"}
      authorName={article.author_name ?? "ArcadeStickLabs"}
      publishedAt={
        article.published_at
          ? new Date(article.published_at).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Draft"
      }
      comments={<Comments />}
      canEdit={true} // 🔒 auth-gate later
      editHref={`/dashboard/articles/edit/${article.slug}`}
    >
      {article.content}
    </ArticleLayout>
  );
}
