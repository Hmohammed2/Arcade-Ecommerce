// components/faq/FAQClient.tsx
"use client";

import { useState } from "react";
import type { FAQItem } from "@/app/faqs/page";

type Props = {
  faqs: FAQItem[];
};

export default function FAQClient({ faqs }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex justify-between items-center p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {faq.question}
              </span>

              <span
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 text-gray-700 dark:text-gray-300">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
