import { useMutation } from "@tanstack/react-query";
import { checkout } from "@/library/checkout";
import { useAuth } from "@/store/useAuth";

export function useCheckout() {
  const { isAuthenticated, accessToken } = useAuth();
  return useMutation({
    mutationFn: (payload: Parameters<typeof checkout>[0]) =>
      checkout(payload, isAuthenticated, accessToken),
  });
}
