const baseUrl = process.env.NEXT_PUBLIC_API_URL_SERVER || "";

export function getImageUrl(path?: string | null): string {
  if (!path) {
    return "/placeholder.png"; // fallback
  }

  // If path is already an absolute URL, return as-is
  if (path.startsWith("http")) {
    return path;
  }

  // Otherwise prefix with API base url
  return `${baseUrl}${path}`;
}
