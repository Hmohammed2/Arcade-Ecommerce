"use client";

export default function TopBanner() {
  return (
    <div className="w-full bg-pink-600 text-white text-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center font-medium">
        🚚 Free UK delivery on orders over{" "}
        <span className="font-bold">£45</span>
      </div>
    </div>
  );
}
