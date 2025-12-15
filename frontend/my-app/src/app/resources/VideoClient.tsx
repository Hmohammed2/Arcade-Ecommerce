"use client";

import { useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import { VideoSkeleton } from "@/components/VideoSkeleton";

type Video = {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  level: "Beginner" | "Modding" | "Advanced";
  duration: string;
  featured?: boolean;
};

const filters = ["All", "Beginner", "Modding", "Advanced"] as const;

export default function VideosClient({ videos }: { videos: Video[] }) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");

  const filteredVideos =
    activeFilter === "All"
      ? videos
      : videos.filter((video) => video.level === activeFilter);

  return (
    <section>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "border hover:bg-muted"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {filteredVideos.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <VideoSkeleton key={i} />)
          : filteredVideos.map((video) => (
              <VideoCard key={video.url} video={video} />
            ))}
      </div>
    </section>
  );
}
