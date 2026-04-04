"use client";

import { useState } from "react";
import VideosClient from "./VideoClient";
import ArticlesSection from "./ArticleSection";
import { videos } from "./videos";
import clsx from "clsx";
import Link from "next/link";

type Tab = "articles" | "videos";

const startHereLinks = [
  {
    title: "New to fightsticks?",
    description:
      "Start with beginner-friendly guides to understand parts, upgrade paths, and what matters before buying.",
    href: "/resources/articles/how-to-choose-the-right-fight-stick",
    cta: "Start with the basics",
  },
  {
    title: "Switching from pad?",
    description:
      "Read setup advice that makes the transition feel less awkward and helps you choose a more sensible first setup.",
    href: "/resources/articles/best-arcade-stick-setup-for-pad-players",
    cta: "See setup advice",
  },
  {
    title: "Already know what you need?",
    description:
      "Skip the reading and go straight to levers, buttons, and beginner-friendly upgrade options.",
    href: "/shop",
    cta: "Browse parts",
  },
];

export default function ResourcesTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("articles");

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("articles")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "articles"
              ? "bg-pink-600 text-white"
              : "bg-muted hover:bg-muted/70",
          )}
        >
          Articles
        </button>

        <button
          onClick={() => setActiveTab("videos")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "videos"
              ? "bg-pink-600 text-white"
              : "bg-muted hover:bg-muted/70",
          )}
        >
          Videos
        </button>
      </div>

      {activeTab === "articles" && (
        <section>
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Articles & written guides
            </h2>
            <p className="mt-3 text-muted-foreground">
              Use these guides to choose the right parts, avoid compatibility
              mistakes, and get clearer on what is actually worth buying for
              your setup.
            </p>
          </div>

          {/* Start here */}
          <div className="mb-12">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Start here
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Most people do better when they begin with the right path rather
                than randomly opening guides.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {startHereLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition hover:shadow-lg hover:border-pink-500"
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-600 transition-colors">
                    {item.title}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>

                  <span className="mt-5 inline-flex text-sm font-medium text-pink-600">
                    {item.cta} →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <ArticlesSection />
        </section>
      )}

      {activeTab === "videos" && (
        <section>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Recommended video guides
            </h2>
            <p className="mt-3 text-muted-foreground">
              Useful third-party videos for visual learners. These are helpful
              for demos and walkthroughs, but they should support rather than
              replace written buying guidance.
            </p>
          </div>

          <div className="mt-8">
            <VideosClient videos={videos} />
          </div>
        </section>
      )}
    </>
  );
}
