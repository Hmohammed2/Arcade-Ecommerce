"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchArticles, Article } from "@/library/fetchArticles";
import { getImageUrl } from "@/library/getImageUrl";

function estimateReadingTime(text?: string) {
  if (!text) return "2 min read";
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

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

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">Loading articles…</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Articles */}
      {!isLoading && !error && articles.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/articles/${article.slug}`}
              className="group flex gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition hover:shadow-lg hover:border-pink-500"
            >
              {/* Thumbnail */}
              {article.thumbnail && (
                <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={getImageUrl(article.thumbnail)}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col flex-1">
                {/* Meta */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString()
                    : "Draft"}{" "}
                  • {estimateReadingTime(article.excerpt)}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-600 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                {/* CTA */}
                <span className="mt-2 text-sm font-medium text-pink-600">
                  Read article →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
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
