"use client";

import { useState, useEffect } from "react";
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

function getEmbedUrl(url: string) {
  try {
    const id = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
}

export default function VideosClient({ videos }: { videos: Video[] }) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");

  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const filteredVideos =
    activeFilter === "All"
      ? videos
      : videos.filter((video) => video.level === activeFilter);

  /* ESC key closes modal */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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
              <VideoCard
                key={video.url}
                video={video}
                onClick={() => setActiveVideo(video)}
              />
            ))}
      </div>

      {/* VIDEO MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 text-white text-2xl hover:opacity-70"
            >
              ✕
            </button>

            {/* Video */}
            <div className="aspect-video">
              <iframe
                src={getEmbedUrl(activeVideo.url)}
                title={activeVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
