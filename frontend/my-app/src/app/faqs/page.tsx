// app/faq/page.tsx
import { Metadata } from "next";
import Script from "next/script";
import FAQClient from "./FAQClient";
import Breadcrumbs from "@/components/BreadCrumb";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | ArcadeStickLabs",
  description:
    "Answers to common questions about checkout, shipping, payments, returns, and international delivery at ArcadeStickLabs.",
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
      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

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
  return [
    {
      id: 1,
      question: "How is shipping calculated?",
      answer:
        "Shipping costs are calculated at checkout based on your delivery address, parcel weight, and selected delivery service. We use real-time carrier rates to ensure accurate pricing.",
    },
    {
      id: 2,
      question: "Do you offer free delivery?",
      answer:
        "Yes. Orders over £45 qualify for free standard delivery. This will be automatically applied at checkout where eligible.",
    },
    {
      id: 3,
      question: "How long does delivery take?",
      answer:
        "Delivery times depend on the shipping method selected at checkout. Standard delivery typically takes 2–4 working days, while express options usually arrive within 1–2 working days.",
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer:
        "We accept all major debit and credit cards as well as PayPal. PayPal offers an express checkout option for faster payments.",
    },
    {
      id: 5,
      question: "Is my shipping address the same as my billing address?",
      answer:
        "By default, your shipping address is set to match your billing address. You can easily change this during checkout if you need your order delivered elsewhere.",
    },
    {
      id: 6,
      question: "Do you ship to Europe?",
      answer:
        "Yes. We currently ship to selected EU countries including France, Germany, Netherlands, Belgium, Spain, Ireland, and Italy. Available delivery options and prices are shown at checkout.",
    },
    {
      id: 7,
      question: "Can I return an item?",
      answer:
        "Yes. Returns are accepted within 30 days of delivery, provided items are unused, in original condition, and returned in original packaging. Please contact support before returning an item.",
    },
  ];
}
