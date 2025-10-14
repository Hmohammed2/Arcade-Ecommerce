import { Suspense } from "react";
import BillingClient from "./BillingClient";

export const metadata = {
  title: "Billing & Shipping Information | Dashboard",
};

export default async function BillingPage() {
  // (Optional) — You can fetch saved billing/shipping info server-side here
  // const userData = await getUserBillingInfo();

  return (
    <section className="dark:bg-gray-900 bg-white min-h-screen py-10 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Billing & Shipping Information
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Manage your saved billing and shipping addresses for faster checkout.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-center text-gray-700 dark:text-gray-300">
            Loading billing information...
          </p>
        }
      >
        {/* Client component boundary */}
        <BillingClient />
      </Suspense>
    </section>
  );
}
