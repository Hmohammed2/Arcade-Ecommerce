"use client";

import { useState } from "react";
import { createArticle } from "@/library/fetchArticles";
import ArticleEditor from "@/components/article/editor";
import { useAuth } from "@/store/useAuth";
import { toast } from "react-hot-toast";
import slugify from "slugify";
import { useRouter } from "next/navigation";

export default function CreateArticleClient() {
  const router = useRouter();
  const accessToken = useAuth((s) => s.accessToken);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!accessToken) {
      toast.error("You must be logged in to create articles");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);

    try {
      await createArticle(
        {
          title,
          slug: slugify(slug || title, { lower: true }),
          excerpt,
          content,
        },
        accessToken,
        thumbnailFile
      );

      toast.success("Article created!");
      router.push("/dashboard/articles");
    } catch (err: any) {
      toast.error(err.message || "Failed to create article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Create New Article</h1>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setSlug(slugify(e.target.value, { lower: true }));
        }}
        placeholder="Article title"
        className="w-full rounded-md border p-3"
      />

      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Custom slug (optional)"
        className="w-full rounded-md border p-3"
      />

      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short excerpt"
        className="w-full rounded-md border p-3 h-24"
      />

      <ArticleEditor
        content={content}
        onChange={setContent}
        onThumbnailChange={setThumbnailFile}
      />

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md bg-pink-600 px-5 py-2 text-white hover:bg-pink-700 disabled:opacity-50"
      >
        {isSaving ? "Creating…" : "Create Article"}
      </button>
    </div>
  );
}
