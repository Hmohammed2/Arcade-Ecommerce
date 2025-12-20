export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
}

export const articles: Article[] = [
  {
    slug: "build-your-first-fightstick",
    title: "How to Build Your First Fightstick",
    excerpt:
      "A beginner-friendly guide covering parts, layout, and assembly for your first arcade stick.",
    publishedAt: "Mar 15, 2025",
    readingTime: "8 min read",
  },
  {
    slug: "sanwa-vs-seimitsu",
    title: "Sanwa vs Seimitsu: Buttons & Levers Compared",
    excerpt:
      "We compare the two most popular arcade component brands and help you choose the right feel.",
    publishedAt: "Mar 22, 2025",
    readingTime: "6 min read",
  },
];
