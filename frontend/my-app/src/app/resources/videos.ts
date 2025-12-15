export type VideoLevel = "Beginner" | "Modding" | "Advanced";

export type ResourceVideo = {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  level: VideoLevel;
  duration: string;
  featured?: boolean;
};

export const videos: ResourceVideo[] = [
  {
    title: "How to Use a Fight Stick and Arcade stick",
    description:
      "Learn what a fightstick is, how it works, and how to choose your first arcade stick.",
    url: "https://www.youtube.com/watch?v=Qi0QMmYnaKM",
    thumbnail: "https://img.youtube.com/vi/Qi0QMmYnaKM/hqdefault.jpg",
    level: "Beginner",
    duration: "28 min",
    featured: true,
  },
  {
    title: "Fightstick overview on grips",
    description:
      "An overview of different fightstick grip styles and how they affect gameplay.",
    url: "https://www.youtube.com/watch?v=Kyo2LtmHMj4",
    thumbnail: "https://img.youtube.com/vi/Kyo2LtmHMj4/hqdefault.jpg",
    level: "Beginner",
    duration: "7 min",
  },
  {
    title: "Building Your Own Fightstick: Comprehensive DIY Guide",
    description:
      "A step-by-step tutorial on building your own custom fightstick from scratch.",
    url: "https://www.youtube.com/watch?v=F6lylBC3oNQ",
    thumbnail: "https://img.youtube.com/vi/F6lylBC3oNQ/hqdefault.jpg",
    level: "Modding",
    duration: "17 min",
  },
];
