const baseUrlServer = process.env.NEXT_PUBLIC_API_URL_SERVER;
const baseUrlClient = process.env.NEXT_PUBLIC_API_URL_CLIENT;

// Fetch all products
export async function fetchProducts() {
  const res = await fetch(`${baseUrlServer}/api/products/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// Fetch a single product by slug
export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${baseUrlServer}/api/products/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function searchProducts(query: string) {
  const res = await fetch(
    `${baseUrlClient}/api/products/?search=${encodeURIComponent(query)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}
