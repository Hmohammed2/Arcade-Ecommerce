"use client";

import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage(children: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchUser } = useAuth();

  useEffect(() => {
    fetchUser(); // ensures user is loaded
  }, [fetchUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
