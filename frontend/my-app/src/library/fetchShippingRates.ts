import { clientEnv } from "@/env-zod-schema/client";
import {
  AddressInput,
  ParcelInput,
  ShippingRate,
  ShippingRatesResponse,
} from "@/types/shipping";

export async function fetchShippingRates(
  address: AddressInput,
  parcel: ParcelInput,
): Promise<ShippingRate[]> {
  const params = new URLSearchParams({
    country: address.country,
    ...(address.postcode && { postcode: address.postcode }),
    weight: parcel.weight.toString(),
    ...(parcel.length && { length: parcel.length.toString() }),
    ...(parcel.width && { width: parcel.width.toString() }),
    ...(parcel.height && { height: parcel.height.toString() }),
  });

  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_URL_CLIENT}/api/shipping/estimate/?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch shipping rates");
  }

  const data: ShippingRatesResponse = await res.json();
  return data.rates;
}
