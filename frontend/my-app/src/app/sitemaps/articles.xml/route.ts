import { fetchArticles } from "@/library/fetchArticles";

export async function GET() {
  const articles = await fetchArticles();

  const urls = articles
    .map((a) => {
      const rawDate = a.updated_at || a.created_at;
      const lastmod =
        rawDate && !isNaN(Date.parse(rawDate))
          ? new Date(rawDate).toISOString()
          : new Date().toISOString();

      return `
    <url>
      <loc>https://arcadesticklabs.co.uk/resources/articles/${a.slug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `;
    })
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`,
    {
      headers: { "Content-Type": "application/xml" },
    },
  );
}
