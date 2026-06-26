"use client";

export default function TermsClient() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-100 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Effective Date: [12/11/2025] | Last Updated: [12/11/2025]
      </p>

      <section className="space-y-6">
        <p>
          Welcome to <strong>ArcadeStickLabs</strong> (“we”, “us”, “our”). These
          Terms and Conditions (“Terms”) govern your use of our website{" "}
          <a
            href="https://arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            arcadesticklabs.co.uk
          </a>{" "}
          (the “Site”) and the purchase of any products offered through it
          (“Products”).
        </p>

        <p>
          By using this Site, you agree to be bound by these Terms. If you do
          not agree, please do not use this Site.
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Use of the Site</h2>
        <p>
          You agree to use the Site for lawful purposes only and in a way that
          does not infringe the rights of, or restrict or inhibit anyone else’s
          use of, the Site.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          2. Product Information and Orders
        </h2>
        <p>
          We make every effort to ensure that product descriptions, images, and
          prices are accurate. However, minor variations may occur. All orders
          are subject to availability and acceptance.
        </p>

        <h2 className="text-2xl font-semibold mt-8">3. Payments</h2>
        <p>
          Payments are processed securely via trusted payment processors such as
          Stripe and PayPal. We do not store full payment details on our
          servers.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          4. Shipping, Delivery and Customs
        </h2>
        <p>
          Orders are dispatched to the delivery address you provide. Delivery
          times are estimates only and may vary depending on location, courier,
          customs processing, and other factors outside of our control.
        </p>

        <p>
          For international orders, you are responsible for any customs duties,
          import taxes, VAT, handling fees, clearance charges, or other charges
          applied by your country’s customs authority or delivery provider.
          These charges are not included in the product price or shipping cost
          unless clearly stated otherwise at checkout.
        </p>

        <p>
          ArcadeStickLabs has no control over these charges and cannot predict
          the exact amount that may be due. If you are ordering from outside the
          United Kingdom, we recommend checking with your local customs office
          before placing your order.
        </p>

        <p>
          If an international order is refused, returned, delayed, or abandoned
          due to unpaid customs charges, import duties, taxes, or failure to
          complete customs clearance, we are not responsible for any resulting
          loss, delay, or additional cost. Any refund issued in such cases may
          exclude shipping costs, return shipping fees, customs charges, and any
          other costs incurred.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Returns & Refunds</h2>
        <p>
          Please refer to our{" "}
          <a
            href="/returns"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            Returns & Refund Policy
          </a>{" "}
          for details on how to return or exchange products.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          6. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, ArcadeStickLabs shall not be
          liable for any indirect, incidental, or consequential damages arising
          out of the use of our Site or Products.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          7. Changes to These Terms
        </h2>
        <p>
          We may update these Terms from time to time. Changes will be posted on
          this page with a revised effective date.
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Contact Us</h2>
        <p>
          For questions about these Terms, please contact us at{" "}
          <a
            href="mailto:support@arcadesticklabs.co.uk"
            className="text-pink-600 dark:text-pink-400 underline"
          >
            support@arcadesticklabs.co.uk
          </a>
          .
        </p>
      </section>
    </main>
  );
}
