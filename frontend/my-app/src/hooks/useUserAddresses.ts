"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { useAuth } from "@/store/useAuth";

export interface UpdateAddressPayload {
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone?: string;
  billing_address1: string;
  billing_address2?: string;
  billing_city: string;
  billing_postcode: string;
  same_as_billing: boolean;
  shipping_address1?: string;
  shipping_address2?: string;
  shipping_city?: string;
  shipping_postcode?: string;
}

export function useUserAddresses() {
  const queryClient = useQueryClient();
  const authorizedFetch = useAuthorizedFetch();
  const { isAuthenticated } = useAuth();

  // 🧩 Fetch user addresses
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: async () => {
      const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/users/addresses/`
      );
      if (!res.ok) throw new Error("Failed to fetch addresses");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // 🧠 Optimistic Update Mutation
  const mutation = useMutation({
    mutationFn: async (payload: UpdateAddressPayload) => {
      const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/users/addresses/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update addresses");
      return res.json();
    },

    // Optimistic UI
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["user-addresses"] });
      const previousData = queryClient.getQueryData(["user-addresses"]);
      queryClient.setQueryData(["user-addresses"], (old: any) => ({
        ...old,
        ...newData,
      }));
      return { previousData };
    },

    onError: (err, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["user-addresses"], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });

  return {
    addresses: data,
    isLoading,
    isError,
    error,
    updateAddresses: mutation.mutateAsync, // ✅ brings this back
    isUpdating: mutation.isPending, // ✅ for button loading
  };
}
