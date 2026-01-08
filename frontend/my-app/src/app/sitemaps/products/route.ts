import { fetchProducts } from "@/library/fetchProducts";

export default async function sitemap() {
  const baseUrl = "https://arcadesticklabs.co.uk";
  const products = await fetchProducts();

  const productUrls = products.map((p: any) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productUrls,
  ];
}
