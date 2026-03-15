import Image from "next/image";

export function VideoCard({
  video,
  onClick,
}: {
  video: any;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="bg-white/90 text-black rounded-full w-16 h-16 flex items-center justify-center text-2xl transform scale-90 group-hover:scale-100 transition">
            ▶
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Text */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {video.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}
