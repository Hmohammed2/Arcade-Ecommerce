"use client";

import { Star, CheckCircle } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Trusted by UK Arcade Players
        </h2>

        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Real feedback from real customers.
        </p>

        {/* Review Card */}
        <div className="mt-12 bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-lg">
          {/* Verified Badge */}
          <div className="flex justify-center items-center gap-2 mb-4 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Verified Purchase
          </div>

          {/* Stars */}
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-pink-600 fill-pink-600" />
            ))}
          </div>

          {/* Quote */}
          <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
            “Genuinely great Sanwa parts — it’s brilliant to buy genuine parts
            from a UK supplier and avoid the knockoff gamble.”
          </p>

          {/* Name */}
          <div className="mt-6">
            <p className="font-semibold text-gray-900 dark:text-white">Kevin</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              UK Customer
            </p>
          </div>
        </div>

        {/* Subtle Reinforcement */}
        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          More reviews coming as the UK FGC continues to grow.
        </p>
      </div>
    </section>
  );
}
