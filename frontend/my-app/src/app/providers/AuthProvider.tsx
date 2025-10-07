"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { refreshAccessToken } = useAuth();

  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshAccessToken();
      },
      1000 * 60 * 10
    ); // every 10 minutes

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
