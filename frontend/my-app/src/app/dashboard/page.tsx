// app/dashboard/page.tsx
import DashboardPageClient from "./DashboardPageClient";

export const metadata = {
  title: "Dashboard | ArcadeStickLabs",
  description: "Manage your account, view orders, and update preferences.",
};

export default function DashboardPage() {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-10 px-6">
        <DashboardPageClient />
      </div>
    </section>
  );
}
