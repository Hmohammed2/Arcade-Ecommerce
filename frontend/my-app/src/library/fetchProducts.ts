import {
  fetchWithTimeout,
  ExtendedFetchOptions,
} from "@/library/fetchWithTimeout";

const baseUrlServer = process.env.NEXT_PUBLIC_API_URL_SERVER;
const baseUrlClient = process.env.NEXT_PUBLIC_API_URL_CLIENT;

const isProd = process.env.NODE_ENV === "production";

export async function fetchProducts() {
  const options: ExtendedFetchOptions = isProd
    ? { next: { revalidate: 300 } }
    : { cache: "no-store" };

  const res = await fetchWithTimeout(`${baseUrlServer}/api/products/`, options);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function fetchProductBySlug(slug: string) {
  const options: ExtendedFetchOptions = isProd
    ? { next: { revalidate: 120 } }
    : { cache: "no-store" };

  const res = await fetchWithTimeout(
    `${baseUrlServer}/api/products/${slug}/`,
    options
  );
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  return res.json();
}

export async function searchProducts(query: string) {
  const res = await fetch(
    `${baseUrlClient}/api/products/?search=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}

export async function fetchBundles() {
  const options: ExtendedFetchOptions = isProd
    ? { next: { revalidate: 300 } }
    : { cache: "no-store" };

  const res = await fetchWithTimeout(`${baseUrlServer}/api/bundles/`, options);
  if (!res.ok) throw new Error(`Failed to fetch bundles: ${res.status}`);
  return res.json();
}

export async function fetchBundleBySlug(slug: string) {
  const res = await fetch(
    `${baseUrlServer}/api/bundles/${slug}/`,
    { cache: "no-store" } // IMPORTANT
  );
  if (!res.ok) throw new Error(`Failed to fetch bundle`);
  return res.json();
}
