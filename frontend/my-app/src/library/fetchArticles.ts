// library/fetchArticles.ts

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  author: number;
  author_name?: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL_CLIENT ?? "http://localhost:8000/";

/* -----------------------------
   PUBLIC (READ)
----------------------------- */

/**
 * Fetch all published articles
 * GET /articles/
 */
export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/articles/articles/`, {
    next: { revalidate: 60 }, // ISR friendly
  });

  if (!res.ok) {
    throw new Error("Failed to fetch articles");
  }

  return res.json();
}

/**
 * Fetch single article by slug
 * GET /articles/:slug/
 */
export async function fetchArticleBySlug(slug: string): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/article/${slug}/`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article: ${slug}`);
  }

  return res.json();
}

/* -----------------------------
   AUTH (WRITE)
----------------------------- */

/**
 * Create a new article (Markdown content)
 * POST /articles/create/
 */
export async function createArticle(
  data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
  },
  accessToken: string,
  thumbnail?: File | null
): Promise<Article> {
  const body = new FormData();

  body.append("title", data.title);
  body.append("slug", data.slug);
  if (data.excerpt) body.append("excerpt", data.excerpt);
  body.append("content", data.content);
  if (thumbnail) body.append("thumbnail", thumbnail);

  const res = await fetch(`${API_BASE}/articles/article/create/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create article");
  }

  return res.json();
}

/**
 * Update an existing article
 * PATCH /articles/:slug/edit/
 */
export async function updateArticle(
  slug: string,
  data: Partial<{
    title: string;
    content: string;
    thumbnail?: File | null;
  }>,
  accessToken: string
): Promise<Article> {
  const hasFile = data.thumbnail instanceof File;

  let body: FormData | string;

  if (hasFile) {
    const form = new FormData();
    if (data.title) form.append("title", data.title);
    if (data.content) form.append("content", data.content);
    form.append("thumbnail", data.thumbnail as File);
    body = form;
  } else {
    body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}/articles/article/${slug}/edit/`, {
    method: "PATCH",
    headers: hasFile
      ? { Authorization: `Bearer ${accessToken}` }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
    body,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update article");
  }

  return res.json();
}
