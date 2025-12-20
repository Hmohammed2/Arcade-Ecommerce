"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchArticles, Article } from "@/library/fetchArticles";

export default function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchArticles()
      .then((data) => {
        if (isMounted) setArticles(data);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load articles");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">
          Articles & Written Guides ({articles.length})
        </h2>
        <p className="mt-2 text-muted-foreground">
          In-depth written guides on fightstick builds, modding, and competitive
          optimisation.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">Loading articles…</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Articles grid */}
      {!isLoading && !error && articles.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/articles/${article.slug}`}
              className="group rounded-xl border bg-background p-6 transition
                         hover:border-pink-500 hover:shadow-lg"
            >
              {/* Meta */}
              <div className="mb-2 text-xs text-muted-foreground">
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString()
                  : "Draft"}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold group-hover:text-pink-600 transition-colors">
                {article.title}
              </h3>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* CTA */}
              <p className="mt-4 text-sm font-medium text-pink-600">
                Read article →
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && articles.length === 0 && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">
            🚧 Articles are currently in progress. Check back soon.
          </p>
        </div>
      )}
    </section>
  );
}
