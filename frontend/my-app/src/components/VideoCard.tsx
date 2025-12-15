type Video = {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  level: "Beginner" | "Modding" | "Advanced";
  duration: string;
  featured?: boolean;
};

export function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block h-full overflow-hidden rounded-xl border transition hover:shadow-md ${
        video.featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className="aspect-video bg-black">
        <img
          src={video.thumbnail}
          alt={`Thumbnail for ${video.title}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">
            {video.level}
          </span>
          <span>•</span>
          <span>{video.duration}</span>
        </div>

        <h3 className="text-lg font-semibold group-hover:underline">
          {video.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {video.description}
        </p>

        <span className="mt-3 inline-block text-sm font-medium text-primary">
          ▶ Watch on YouTube
        </span>
      </div>
    </a>
  );
}
