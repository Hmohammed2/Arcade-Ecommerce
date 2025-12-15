"use client";

import { useState } from "react";
import VideosClient from "./VideoClient";
import ArticlesSection from "./ArticleSection";
import { videos } from "./videos";
import clsx from "clsx";

type Tab = "videos" | "articles";

export default function ResourcesTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("videos");

  return (
    <>
      {/* Tabs */}
      <div className="mb-10 flex gap-2">
        <button
          onClick={() => setActiveTab("videos")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "videos"
              ? "bg-pink-600 text-white"
              : "bg-muted hover:bg-muted/70"
          )}
        >
          Videos
        </button>

        <button
          onClick={() => setActiveTab("articles")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "articles"
              ? "bg-pink-600 text-white"
              : "bg-muted hover:bg-muted/70"
          )}
        >
          Articles
        </button>
      </div>

      {/* Content */}
      {activeTab === "videos" && (
        <section>
          <h2 className="mb-6 text-3xl font-semibold">
            Recommended Video Guides
          </h2>
          <VideosClient videos={videos} />
        </section>
      )}

      {activeTab === "articles" && <ArticlesSection />}
    </>
  );
}
