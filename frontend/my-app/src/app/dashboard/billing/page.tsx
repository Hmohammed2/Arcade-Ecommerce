// app/dashboard/billing/page.tsx
import { Suspense } from "react";
import BillingClient from "./BillingClient";

export const metadata = {
  title: "Billing & Shipping Information | Dashboard",
};

export default async function BillingPage() {
  // (Optional) — You can fetch saved billing/shipping info server-side here
  // const userData = await getUserBillingInfo();

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Billing & Shipping Information
      </h1>

      <p className="text-gray-600 mb-10">
        Manage your saved billing and shipping addresses for faster checkout.
      </p>

      <Suspense fallback={<p>Loading billing information...</p>}>
        {/* Client component boundary */}
        <BillingClient />
      </Suspense>
    </section>
  );
}
