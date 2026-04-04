import Image from "next/image";
import React, { ReactNode } from "react";
import TableOfContents from "@/app/resources/articles/[slug]/TableOfContents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getImageUrl } from "@/library/getImageUrl";
import Breadcrumbs from "@/components/BreadCrumb";
import { slugify } from "@/library/slugify";
import StickyCTA from "./StickyCTA";

interface ArticleCTA {
  label: string;
  href: string;
}

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
  cta?: ArticleCTA;
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
  cta,
}: ArticleLayoutProps) {
  return (
    <article className="relative min-h-screen pb-24 bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Resources", href: "/resources" },
            { label: title },
          ]}
        />

        {/* Hero Thumbnail */}
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <Image
            src={thumbnail}
            alt={title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
          {/* Main Article Card */}
          <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl p-8 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
            {/* Meta */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-300">
                  {authorAvatar && (
                    <Image
                      src={getImageUrl(authorAvatar)}
                      alt={authorName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {authorName}
                  </p>
                  <p>{publishedAt}</p>
                </div>
              </div>

              {canEdit && editHref && (
                <a
                  href={editHref}
                  className="rounded-lg border border-pink-500/40 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition"
                >
                  Edit
                </a>
              )}
            </div>

            {/* Markdown Content */}
            <div
              className="  prose prose-gray dark:prose-invert max-w-none 
              prose-h2:scroll-mt-24 prose-h3:scroll-mt-24
              prose-p:my-1.5
              prose-li:my-0.5
              prose-headings:mt-5 prose-headings:mb-2"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h2: ({ ...props }) => {
                    const id = slugify(String(props.children));
                    return <h2 id={id} {...props} />;
                  },
                  h3: ({ ...props }) => {
                    const id = slugify(String(props.children));
                    return <h3 id={id} {...props} />;
                  },
                }}
              >
                {children}
              </ReactMarkdown>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-10">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur rounded-xl p-6 shadow ring-1 ring-black/5 dark:ring-white/10">
                <TableOfContents />
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* Mobile TOC (Floating Button + Drawer) */}
      <div className="lg:hidden">
        <TableOfContents />
      </div>
      {/* Sticky Bottom CTA */}
      {cta && <StickyCTA label={cta.label} href={cta.href} />}
    </article>
  );
}
