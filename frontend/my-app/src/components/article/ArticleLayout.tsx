import Image from "next/image";
import React, { ReactNode } from "react";
import TableOfContents from "@/app/resources/articles/[slug]/TableOfContents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getImageUrl } from "@/library/getImageUrl";
import Breadcrumbs from "@/components/BreadCrumb";
import { slugify } from "@/library/slugify";

interface ArticleLayoutProps {
  title: string;
  thumbnail: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  children: string;
  comments: ReactNode;
  canEdit?: boolean;
  editHref?: string;
}

export default function ArticleLayout({
  title,
  thumbnail,
  authorName,
  authorAvatar,
  publishedAt,
  children,
  comments,
  canEdit = false,
  editHref,
}: ArticleLayoutProps) {
  return (
    <article className="mx-auto max-w-7xl px-4 py-12 dark:text-gray-100 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: title },
        ]}
      />
      {/* Thumbnail */}
      <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg">
        <Image
          src={thumbnail}
          alt={title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div>
          {/* Title */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

            {canEdit && editHref && (
              <a
                href={editHref}
                className="rounded-md border px-3 py-1.5 text-sm font-medium
                 text-muted-foreground hover:text-foreground
                 hover:border-pink-500 transition-colors"
              >
                Edit article
              </a>
            )}
          </div>

          {/* Author */}
          <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-200">
              {authorAvatar ? (
                <Image
                  src={getImageUrl(authorAvatar)}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="font-medium text-foreground">{authorName}</p>
              <p>{publishedAt}</p>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h2: ({ node, ...props }) => {
                  const id = slugify(String(props.children));
                  return <h2 id={id} {...props} />;
                },
                h3: ({ node, ...props }) => {
                  const id = slugify(String(props.children));
                  return <h3 id={id} {...props} />;
                },
              }}
              children={children}
            />
          </div>

          {/* Mobile comments */}
          <div className="mt-16 lg:hidden">
            <h2 className="mb-4 text-xl font-semibold">Comments</h2>
            {comments}
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-10">
            <TableOfContents />
            <div>
              <h2 className="mb-4 text-lg font-semibold">Comments</h2>
              {comments}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
