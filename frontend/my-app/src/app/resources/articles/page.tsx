export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchArticles } from "@/library/fetchArticles";

export const revalidate = 300;

export const metadata = {
  title: "Fightstick Modding Guides & Arcade Stick Articles | ArcadeStickLabs",
  description:
    "In-depth written guides covering Sanwa, Seimitsu, Brook boards, Korean levers, and competitive fightstick optimisation.",
};

export default async function ArticlesIndexPage() {
  const articles = await fetchArticles();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-bold">
        Fightstick Modding Guides & Written Articles
      </h1>

      <p className="mt-3 text-muted-foreground">
        Professional tutorials and modding guides written by ArcadeStickLabs for
        competitive and casual arcade stick players.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <article key={article.slug} className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">
              <Link href={`/resources/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h2>
            {article.excerpt && (
              <p className="mt-2 text-muted-foreground">{article.excerpt}</p>
            )}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "CollectionPage",
                  name: "Fightstick Modding Articles",
                  url: "https://arcadesticklabs.co.uk/resources/articles",
                  mainEntity: articles.map((a) => ({
                    "@type": "BlogPosting",
                    headline: a.title,
                    url: `https://arcadesticklabs.co.uk/resources/articles/${a.slug}`,
                    datePublished: a.published_at,
                  })),
                }),
              }}
            />
          </article>
        ))}
      </div>
    </main>
  );
}
