import { fetchArticles } from "@/library/fetchArticles";

export async function GET() {
  const articles = await fetchArticles();

  const urls = articles
    .map(
      (a: any) => `
    <url>
      <loc>https://arcadesticklabs.co.uk/resources/articles/${a.slug}</loc>
      <lastmod>${new Date(a.updated_at || a.created_at).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`,
    {
      headers: { "Content-Type": "application/xml" },
    }
  );
}
