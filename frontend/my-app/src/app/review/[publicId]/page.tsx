// app/review/[publicId]/page.tsx
import ReviewClient from "./ReviewPageClient";

export const metadata = {
  title: "Leave a Review | ArcadeStickLabs",
  description: "Leave a verified purchase review for your order.",
};

interface PageProps {
  params: { publicId: string };
  searchParams?: { t?: string }; // optional token support later
}

export default function ReviewPage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">Leave a review</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Thanks for your order! Your feedback helps other FGC players.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <ReviewClient
            publicId={params.publicId}
            token={searchParams?.t || ""}
          />
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Reviews may be moderated to prevent spam/abuse.
        </p>
      </div>
    </main>
  );
}
