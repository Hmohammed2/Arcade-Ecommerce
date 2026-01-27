import { Suspense } from "react";
import CheckoutSuccessResolver from "./CheckoutSuccessResolver";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-300">
          <p>Finalising your payment…</p>
        </div>
      }
    >
      <CheckoutSuccessResolver />
    </Suspense>
  );
}
