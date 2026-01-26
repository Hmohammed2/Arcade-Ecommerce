// components/faq/FAQClient.tsx
"use client";

import { useState } from "react";
import type { FAQItem } from "@/app/faqs/page";
import { ChevronDown } from "lucide-react";

type Props = {
  faqs: FAQItem[];
};

export default function FAQClient({ faqs }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className="
              rounded-xl border
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900
              transition-colors
            "
          >
            {/* Question */}
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              className="
                w-full flex items-center justify-between gap-4
                px-5 py-4 text-left
                focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600
              "
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {faq.question}
              </span>

              <ChevronDown
                className={`
                  h-5 w-5 shrink-0
                  text-gray-500 dark:text-gray-400
                  transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* Answer */}
            <div
              className={`
                overflow-hidden transition-all duration-200
                ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              <div className="px-5 pb-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
