import { fetchProducts } from "@/library/fetchProducts";

export async function GET() {
  const products = await fetchProducts();

  const urls = products
    .map(
      (p: any) => `
    <url>
      <loc>https://arcadesticklabs.co.uk/products/${p.slug}</loc>
      <lastmod>${new Date(p.updated_at || p.created_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>
  `
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       ${urls}
     </urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}
