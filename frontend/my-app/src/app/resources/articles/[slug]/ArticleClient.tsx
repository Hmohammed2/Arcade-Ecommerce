"use client";

import { useEffect } from "react";
import ArticleLayout from "@/components/article/ArticleLayout";
import Comments from "@/components/article/Comments";
import { Article } from "@/library/fetchArticles";
import { getImageUrl } from "@/library/getImageUrl";
import { useAuth } from "@/store/useAuth";
import { gaEvent } from "@/library/ga";

interface ArticleClientProps {
  article: Article;
}

export default function ArticleClient({ article }: ArticleClientProps) {
  const user = useAuth((s) => s.user);

  /* -----------------------------------
     Persist last viewed article
  ----------------------------------- */
  useEffect(() => {
    sessionStorage.setItem("last_article", article.slug);
  }, [article.slug]);

  /* -----------------------------------
     GA tracking
  ----------------------------------- */
  useEffect(() => {
    gaEvent("view_item_list", {
      item_list_id: article.slug,
      item_list_name: article.title,
    });
  }, [article.slug, article.title]);

  return (
    <ArticleLayout
      title={article.title}
      thumbnail={
        getImageUrl(article.thumbnail) ?? "/images/articles/placeholder.jpg"
      }
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
      canEdit={user?.is_staff}
      editHref={`/dashboard/articles/edit/${article.slug}`}
    >
      {article.content}
    </ArticleLayout>
  );
}
