"use client";
export default function Error({ error }: { error: Error }) {
  console.error("Product page crashed:", error);
  return (
    <div className="p-8 text-red-600">
      <h2>Something went wrong loading this product.</h2>
      <p>{error.message}</p>
    </div>
  );
}
