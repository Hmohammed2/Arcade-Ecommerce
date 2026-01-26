// src/hooks/useShippingRates.ts

import { useQuery } from "@tanstack/react-query";
import {
  fetchShippingRates,
  AddressInput,
  ParcelInput,
  ShippingRate,
} from "@/library/fetchShippingRates";

type UseShippingRatesArgs = {
  address?: AddressInput;
  parcel?: ParcelInput;
  enabled?: boolean;
};

export function useShippingRates({
  address,
  parcel,
  enabled = true,
}: UseShippingRatesArgs) {
  return useQuery<ShippingRate[]>({
    queryKey: ["shipping-rates", address, parcel],
    queryFn: () => {
      if (!address || !parcel) {
        throw new Error("Missing address or parcel");
      }
      return fetchShippingRates(address, parcel);
    },
    enabled: Boolean(address && parcel && enabled),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
