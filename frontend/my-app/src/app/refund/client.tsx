"use client";

export default function ReturnsClient() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-100 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Returns & Refund Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Effective Date: [12/11/2025] | Last Updated: [12/11/2025]
      </p>

      <section className="space-y-6">
        <p>
          At <strong>ArcadeStickLabs</strong>, we take pride in the quality and
          craftsmanship of our arcade products. However, if you are not
          completely satisfied with your purchase, this Returns and Refund
          Policy explains your rights and our procedures for returns,
          replacements, and refunds.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          1. Eligibility for Returns
        </h2>
        <p>
          You may request a refund within <strong>48 hours</strong> of receiving
          your order. To be eligible for a refund:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            The item must be returned in <strong>unused</strong> condition and
            free from any signs of wear, modification, or physical damage.
          </li>
          <li>
            All original packaging, cables, and accessories must be included.
          </li>
          <li>
            Requests submitted after 48 hours of delivery may not be eligible
            for refund or exchange.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">
          2. How to Request a Return or Refund
        </h2>
        <p>
          To initiate a return, please contact our support team at{" "}
          <a
            href="mailto:support@arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            support@arcadesticklabs.co.uk
          </a>{" "}
          within 48 hours of receiving your order. Please include your order
          number, full name, and a brief description of your reason for return.
        </p>
        <p>
          Our team will review your request and provide instructions on how to
          return the product safely.
        </p>

        <h2 className="text-2xl font-semibold mt-8">3. Refund Process</h2>
        <p>
          Once we receive and inspect the returned item, we will notify you of
          the approval or rejection of your refund. Approved refunds will be
          processed within <strong>5–10 business days</strong> to the original
          payment method.
        </p>
        <p>
          All refund transactions are securely handled via{" "}
          <strong>Stripe</strong> or <strong>PayPal</strong>, depending on how
          you originally paid. If a dispute has already been opened through one
          of these platforms, your refund will be handled directly through their
          resolution process.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          4. Non-Refundable Situations
        </h2>
        <p>Refunds will not be granted in the following cases:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Products returned after the 48-hour window.</li>
          <li>
            Items showing any signs of physical damage, misuse, or tampering.
          </li>
          <li>
            Custom-built or modified products specifically tailored to your
            request.
          </li>
          <li>Digital goods or downloadable items.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">
          5. Damaged or Faulty Items
        </h2>
        <p>
          If your order arrives damaged or faulty, please contact us within{" "}
          <strong>48 hours</strong> of delivery with clear photos of the damage
          and packaging. We will assess the issue and provide a replacement or
          refund if appropriate.
        </p>
        <p className="italic">
          Please note: ArcadeStickLabs is <strong>not liable</strong> for any
          damage that occurs during shipping or transit. Responsibility for such
          damage lies with the courier, and claims must be made directly to them
          where applicable.
        </p>

        <h2 className="text-2xl font-semibold mt-8">6. Exchanges</h2>
        <p>
          We only replace items if they are defective or damaged. If you need to
          exchange an item for the same product, contact us at{" "}
          <a
            href="mailto:support@arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            support@arcadesticklabs.co.uk
          </a>{" "}
          within 48 hours of delivery.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          7. Late or Missing Refunds
        </h2>
        <p>
          If you haven’t received your refund within 10 business days after
          approval, please check with your bank or payment provider. Processing
          times can vary between financial institutions.
        </p>
        <p>
          If you still haven’t received your refund, please email us at{" "}
          <a
            href="mailto:support@arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            support@arcadesticklabs.co.uk
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Contact Us</h2>
        <p>
          For any questions about returns, refunds, or disputes, please contact
          us at{" "}
          <a
            href="mailto:support@arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            support@arcadesticklabs.co.uk
          </a>
          . We aim to respond to all inquiries within 24 hours.
        </p>
      </section>
    </main>
  );
}
