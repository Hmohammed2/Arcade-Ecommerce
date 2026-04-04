"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { fetchArticles, Article } from "@/library/fetchArticles";
import { getImageUrl } from "@/library/getImageUrl";

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

function getArticleTag(article: Article) {
  const title = article.title.toLowerCase();
  const excerpt = article.excerpt?.toLowerCase() ?? "";
  const combined = `${title} ${excerpt}`;

  if (
    combined.includes("beginner") ||
    combined.includes("start") ||
    combined.includes("choose")
  ) {
    return "Beginner";
  }

  if (
    combined.includes("tekken") ||
    combined.includes("korean lever") ||
    combined.includes("sanwa") ||
    combined.includes("seimitsu")
  ) {
    return "Buying Guide";
  }

  if (
    combined.includes("buttons") ||
    combined.includes("lever") ||
    combined.includes("mod") ||
    combined.includes("setup")
  ) {
    return "Parts & Setup";
  }

  return "Guide";
}

function getWhyItMatters(article: Article) {
  const title = article.title.toLowerCase();
  const excerpt = article.excerpt?.toLowerCase() ?? "";
  const combined = `${title} ${excerpt}`;

  if (combined.includes("pad")) {
    return "Useful if you are switching from pad and want a setup that feels easier to adapt to.";
  }

  if (combined.includes("button")) {
    return "Helpful if you are unsure which button size or style makes sense before you buy.";
  }

  if (combined.includes("korean lever") || combined.includes("sanwa")) {
    return "Best if you are comparing common lever options and want to avoid choosing the wrong feel.";
  }

  if (combined.includes("beginner") || combined.includes("choose")) {
    return "Best starting point if you want a clearer buying path before browsing individual parts.";
  }

  return "Good overview if you want practical guidance before committing to parts.";
}

export default function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchArticles()
      .then((data) => {
        if (!isMounted) return;

        const publishedOnly = data.filter((article) => !!article.published_at);

        const sorted = [...publishedOnly].sort((a, b) => {
          const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
          const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;

          return bDate - aDate;
        });

        setArticles(sorted);
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

  const featuredArticles = useMemo(
    () => articles.filter((article) => article.featured),
    [articles],
  );

  const remainingArticles = useMemo(
    () => articles.filter((article) => !article.featured),
    [articles],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">Loading articles…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          No articles are live yet. Add a few published guides first so this
          section does not look empty.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {featuredArticles.length > 0 && (
        <div>
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recommended starting points
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              These are the best first reads if you want clearer buying
              decisions, not just more information.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/articles/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-lg hover:border-pink-500"
              >
                {article.thumbnail && (
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={getImageUrl(article.thumbnail)}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-pink-100 px-2.5 py-1 font-medium text-pink-700 dark:bg-pink-500/15 dark:text-pink-300">
                      Featured
                    </span>
                    <span className="rounded-full bg-pink-100 px-2.5 py-1 font-medium text-pink-700 dark:bg-pink-500/15 dark:text-pink-300">
                      {getArticleTag(article)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(
                        article.published_at as string,
                      ).toLocaleDateString()}{" "}
                      • {estimateReadingTime(article.content)}
                    </span>
                  </div>

                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-600 transition-colors">
                    {article.title}
                  </h4>

                  {article.excerpt && (
                    <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {article.excerpt}
                    </p>
                  )}

                  <p className="mt-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {getWhyItMatters(article)}
                  </p>

                  <span className="mt-5 inline-flex text-sm font-medium text-pink-600">
                    Read guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {remainingArticles.length > 0 && (
        <div>
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              More guides
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse the rest of the library by topic and intent.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {remainingArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/articles/${article.slug}`}
                className="group flex gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition hover:shadow-lg hover:border-pink-500"
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

                <div className="flex flex-1 flex-col">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-pink-100 px-2 py-1 font-medium text-pink-700 dark:bg-pink-500/15 dark:text-pink-300">
                      {getArticleTag(article)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(
                        article.published_at as string,
                      ).toLocaleDateString()}{" "}
                      • {estimateReadingTime(article.content)}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-600 transition-colors">
                    {article.title}
                  </h4>

                  {article.excerpt && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {getWhyItMatters(article)}
                  </p>

                  <span className="mt-3 text-sm font-medium text-pink-600">
                    Read article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
