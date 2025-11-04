"use client";

export default function Error({ error }: { error: Error }) {
  console.error("Checkout page crashed:", error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50 px-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-700 max-w-md">
        {error.message ||
          "We couldn’t load the checkout. Please try again later."}
      </p>
      <p className="mt-8 text-sm text-gray-500">
        If the problem persists, contact support.
      </p>
    </div>
  );
}
