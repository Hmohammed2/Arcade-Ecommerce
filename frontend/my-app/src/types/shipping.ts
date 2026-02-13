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
