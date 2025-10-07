import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/useAuth";

export const useOrders = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/orders/history/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!accessToken, // only runs when logged in
  });
};
