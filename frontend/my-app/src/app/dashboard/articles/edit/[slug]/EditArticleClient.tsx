"use client";

import { useEffect, useState } from "react";
import {
  fetchArticleBySlug,
  updateArticle,
  Article,
} from "@/library/fetchArticles";
import ArticleEditor from "@/components/article/editor";
import { useAuth } from "@/store/useAuth"; // assuming you already have this
import { toast } from "react-hot-toast";

interface EditArticleClientProps {
  slug: string;
}

export default function EditArticleClient({ slug }: EditArticleClientProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const accessToken = useAuth((s) => s.accessToken);

  /* -----------------------------
     Fetch existing article
  ----------------------------- */
  useEffect(() => {
    fetchArticleBySlug(slug)
      .then((data) => {
        setArticle(data);
        setContent(data.content);
      })
      .catch(() => {
        toast.error("Failed to load article");
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  /* -----------------------------
     Save handler
  ----------------------------- */
  const handleSave = async () => {
    if (!accessToken) {
      toast.error("You must be logged in to edit articles");
      return;
    }

    setIsSaving(true);

    try {
      await updateArticle(
        slug,
        { title: article?.title, content },
        accessToken
      );
      toast.success("Article updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  /* -----------------------------
     States
  ----------------------------- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-muted-foreground">Loading editor…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-red-500">Article not found</p>
      </div>
    );
  }

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editing: {article.title}</h1>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-pink-700 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Editor */}
      <ArticleEditor content={content} onChange={setContent} />
    </div>
  );
}
