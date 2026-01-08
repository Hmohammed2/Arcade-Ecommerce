export async function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <sitemap>
    <loc>https://arcadesticklabs.co.uk/sitemaps/products.xml</loc>
  </sitemap>

  <sitemap>
    <loc>https://arcadesticklabs.co.uk/sitemaps/articles.xml</loc>
  </sitemap>

</sitemapindex>`,
    {
      headers: { "Content-Type": "application/xml" },
    }
  );
}
