"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

interface BrandVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function BrandVideo({
  videoSrc = "/videos/brand-unboxing.mp4",
  posterSrc = "/images/brand-video-poster.jpg",
  title = "Behind ArcadeStickLabs",
  eyebrow = "Behind the brand",
  description = "ArcadeStickLabs was built from genuine enthusiasm for fight sticks, arcade parts, and the details that matter to players. Here’s a closer look behind the store and the kind of hardware we care about.",
  autoPlay = false,
  showControls = true,
}: BrandVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasStarted, setHasStarted] = useState(autoPlay);

  const handlePlay = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.play();
      setHasStarted(true);
    } catch {
      setHasStarted(true);
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-pink-600">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {title}
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
            {description}
          </p>

          <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-pink-600" />
              <p>Specialist-focused parts, not generic catalogue filler.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-pink-600" />
              <p>
                Real interest in arcade hardware, modding, and part quality.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-pink-600" />
              <p>
                A store built for players who actually care about the details.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-xl dark:border-gray-800">
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                poster={posterSrc}
                muted
                playsInline
                loop={autoPlay}
                autoPlay={autoPlay}
                controls={showControls && hasStarted}
                preload="metadata"
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {!hasStarted && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label="Play brand video"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-lg transition group-hover:scale-105">
                    <Play className="ml-1 h-7 w-7 fill-current" />
                  </span>
                </button>
              )}
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
            A closer look at the hands-on side of ArcadeStickLabs.
          </p>
        </div>
      </div>
    </section>
  );
}
