"use client";

export default function PrivacyClient() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-100 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Effective Date: [12/11/2025] | Last Updated: [12/11/2025]
      </p>

      <section className="space-y-6">
        <p>
          This Privacy Policy explains how <strong>ArcadeStickLabs</strong>{" "}
          collects, uses, and protects your personal information when you use
          our website{" "}
          <a
            href="https://arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            arcadesticklabs.co.uk
          </a>{" "}
          or purchase our products. We comply with the UK General Data
          Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          1. Information We Collect
        </h2>
        <p>
          We may collect personal information such as your name, email address,
          postal address, phone number, and payment details when you make a
          purchase or create an account.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          2. How We Use Your Information
        </h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Process and fulfill your orders.</li>
          <li>Provide customer support and respond to inquiries.</li>
          <li>Send important service updates and order confirmations.</li>
          <li>Improve our website and product offerings.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Data Protection</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data from unauthorized access, loss, or misuse.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          4. Sharing of Information
        </h2>
        <p>
          We do not sell your personal information. We may share it with trusted
          third parties (such as payment processors and couriers) only when
          necessary to fulfill your order.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Cookies</h2>
        <p>
          We use cookies and similar technologies to enhance your browsing
          experience and analyze site traffic. You can adjust your cookie
          settings in your browser.
        </p>

        <h2 className="text-2xl font-semibold mt-8">6. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal
          information. You may also object to certain types of processing.
          Please contact us at{" "}
          <a
            href="mailto:support@arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            support@arcadesticklabs.co.uk
          </a>{" "}
          to exercise your rights.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          7. Updates to This Policy
        </h2>
        <p>
          We may update this Privacy Policy periodically. Updates will be
          published on this page with a revised effective date.
        </p>
      </section>
    </main>
  );
}
