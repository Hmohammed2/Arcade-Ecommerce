"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle } from "lucide-react";

type Review = {
  rating: number;
  title?: string;
  body: string;
  display_name: string;
  verified_purchase: boolean;
  created_at: string;
};

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/reviews/approved/?limit=6`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data: Review[] = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Trusted by UK Arcade Players
        </h2>

        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Real feedback from real customers.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {reviews.map((review, index) => (
            <div
              key={`${review.display_name}-${review.created_at}-${index}`}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg text-center"
            >
              {review.verified_purchase && (
                <div className="flex justify-center items-center gap-2 mb-4 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Verified Purchase
                </div>
              )}

              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "text-pink-600 fill-pink-600"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {review.title && (
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  {review.title}
                </h3>
              )}

              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                “{review.body}”
              </p>

              <div className="mt-6">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {review.display_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  UK Customer
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          More reviews coming as the UK FGC continues to grow.
        </p>
      </div>
    </section>
  );
}
