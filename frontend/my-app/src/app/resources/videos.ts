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
  {
    title:
      "Fightstick mods and customization options - What can you change on your arcade stick?",
    description:
      "Explore various modification and customization options for your fightstick to enhance performance and aesthetics.",
    url: "https://www.youtube.com/watch?v=1qZ7RRHy-Mc",
    thumbnail: "https://img.youtube.com/vi/1qZ7RRHy-Mc/hqdefault.jpg",
    level: "Modding",
    duration: "6 min",
  },
  {
    title: "Tekken EWGF Tutorial On Arcade Stick ( Electrics )",
    description:
      "Learn how to perform Electric Wind God Fist (EWGF) moves in Tekken using an arcade stick.",
    url: "https://www.youtube.com/watch?v=4SL1rmxg5KI",
    thumbnail: "https://img.youtube.com/vi/4SL1rmxg5KI/hqdefault.jpg",
    level: "Advanced",
    duration: "8 min",
  },
  {
    title: "Square vs Octagonal vs Circular Gate",
    description:
      "A detailed comparison of square, octagonal, and circular gates for fightsticks, discussing their pros and cons.",
    url: "https://www.youtube.com/watch?v=eMIzsIwSkjs",
    thumbnail: "https://img.youtube.com/vi/eMIzsIwSkjs/hqdefault.jpg",
    level: "Modding",
    duration: "7 min",
  },
];
