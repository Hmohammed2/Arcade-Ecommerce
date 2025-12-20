// app/faq/page.tsx
import { Metadata } from "next";
import FAQClient from "./FAQClient";
import Breadcrumbs from "@/components/BreadCrumb";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Your Store",
  description:
    "Find answers to common questions about orders, shipping, returns, and products.",
};

export type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        Frequently Asked Questions
      </h1>

      <FAQClient faqs={faqs} />
    </main>
  );
}

/* ---------------- data source ---------------- */

async function getFAQs(): Promise<FAQItem[]> {
  // Replace with API / DB later
  return [
    {
      id: 1,
      question: "How long does shipping take?",
      answer:
        "Orders are dispatched based on the delivery option selected at checkout. Standard delivery typically takes 2–4 business days, while Express delivery usually arrives within 1–2 business days. All orders are shipped via Royal Mail.",
    },
    {
      id: 2,
      question: "Can I return an item?",
      answer:
        "Yes. Returns are accepted within 30 days of delivery, provided the item is unused, in its original condition, and returned in the original packaging.",
    },
    {
      id: 4,
      question: "Do you ship internationally?",
      answer:
        "At this time, we are only selling to customers within the United Kingdom. International customers are welcome to contact us at sales@arcadesticklabs.co.uk to discuss availability and shipping options.",
    },
  ];
}
