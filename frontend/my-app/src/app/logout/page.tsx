"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  return (
    <p className="p-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-100">
      Signing you out…
    </p>
  );
}
