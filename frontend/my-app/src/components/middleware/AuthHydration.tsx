// components/AuthHydration.tsx
"use client";
import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";

export default function AuthHydration() {
  const fetchUser = useAuth((s) => s.fetchUser);
  const accessToken = useAuth((s) => s.accessToken);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (accessToken && !user) fetchUser();
  }, [accessToken, user, fetchUser]);

  return null; // nothing rendered
}
