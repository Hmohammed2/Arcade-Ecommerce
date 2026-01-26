// src/lib/shipping/fetchShippingRates.ts

export type AddressInput = {
  country: string; // ISO-2 e.g. "GB", "FR", "DE"
  postcode?: string; // Optional for some countries
};

export type ParcelInput = {
  weight: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
};

export type ShippingRate = {
  id: string;
  carrier: "evri" | "royal_mail" | string;
  service_code: string;
  service_name: string;
  price: number; // in GBP
  currency: "GBP" | string;
  estimated_days?: number;
  tracking: boolean;
};

export type ShippingRatesResponse = {
  rates: ShippingRate[];
};

export async function fetchShippingRates(
  address: AddressInput,
  parcel: ParcelInput
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
    `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/shipping/estimate/?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch shipping rates");
  }

  const data: ShippingRatesResponse = await res.json();
  return data.rates;
}
