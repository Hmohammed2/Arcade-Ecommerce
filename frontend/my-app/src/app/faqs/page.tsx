// app/faq/page.tsx
import { Metadata } from "next";
import Script from "next/script";
import FAQClient from "./FAQClient";
import Breadcrumbs from "@/components/BreadCrumb";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | ArcadeStickLabs",
  description:
    "Answers to common questions about checkout, shipping, payments, returns, customs charges, and international delivery at ArcadeStickLabs.",
};

export type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <section
      className="
        py-20
        bg-white dark:bg-gray-900
        text-black dark:text-white
        transition-colors
      "
    >
      <main className="max-w-7xl mx-auto px-6">
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

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        />

        {/* Heading */}
        <h1
          className="
            text-3xl font-bold mb-8
            text-black dark:text-white
          "
        >
          Frequently Asked Questions
        </h1>

        {/* FAQ accordion */}
        <FAQClient faqs={faqs} />
      </main>
    </section>
  );
}

/* ---------------- data source ---------------- */

async function getFAQs(): Promise<FAQItem[]> {
  return [
    {
      id: 1,
      question: "How is shipping calculated?",
      answer:
        "Shipping is charged at a fixed rate based on your selected delivery method and destination. The final shipping cost is shown clearly at checkout before payment.",
    },
    {
      id: 2,
      question: "Do you offer free delivery?",
      answer:
        "Yes. UK orders qualify for free standard delivery when the order total is £45 or more. Free delivery is applied automatically at checkout where eligible.",
    },
    {
      id: 3,
      question: "Do you offer free shipping to Europe?",
      answer:
        "At the moment, free delivery is available for UK orders only. EU orders are shipped at a flat rate, which is shown at checkout before payment. This shipping fee does not include any customs duties, import taxes, VAT, handling fees, or clearance charges that may be applied by your country.",
    },
    {
      id: 4,
      question: "Will I have to pay customs, import duties, or taxes?",
      answer:
        "If you are ordering from outside the United Kingdom, you may be required to pay customs duties, import taxes, VAT, handling fees, clearance charges, or other fees charged by your local customs authority or delivery provider. These charges are not included in the product price or shipping cost unless clearly stated otherwise at checkout. ArcadeStickLabs does not control these charges and cannot predict the exact amount due, so we recommend checking with your local customs office before ordering.",
    },
    {
      id: 5,
      question: "How long does delivery take?",
      answer:
        "Delivery times depend on the shipping option you select at checkout. Standard delivery typically takes 2–3 working days, while express delivery usually arrives within 1–2 working days. International orders may take longer due to customs processing or delays outside of our control.",
    },
    {
      id: 6,
      question: "Which countries do you ship to?",
      answer:
        "We currently ship within the UK and to selected EU countries, including France, Germany, Netherlands, Belgium, Spain, Ireland, and Italy. Available options are shown during checkout.",
    },
    {
      id: 7,
      question: "What payment methods do you accept?",
      answer:
        "We accept all major debit and credit cards, as well as PayPal. Both options are available at checkout for secure payment.",
    },
    {
      id: 8,
      question: "Can I ship to a different address from my billing address?",
      answer:
        "Yes. You can enter a separate shipping address during checkout if your order needs to be delivered to a different location.",
    },
    {
      id: 9,
      question: "What if I enter the wrong shipping country or postcode?",
      answer:
        "To ensure accurate delivery and pricing, your postcode must match the selected country. Orders with mismatched address details may be rejected at checkout.",
    },
    {
      id: 10,
      question: "Can I return an item?",
      answer:
        "Yes. Returns are accepted within 30 days of delivery, provided items are unused, in original condition, and returned in their original packaging. Please contact us before returning any item.",
    },
  ];
}
