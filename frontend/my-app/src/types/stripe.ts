import { LineItem } from "@/types/cart"; // wherever you defined it

export interface CreatePaymentIntentPayload {
  first_name: string | undefined | undefined;
  last_name: string | undefined;

  items: LineItem[];

  shipping_name: string | undefined;
  shipping_method_name: string | undefined;

  shipping_postcode: string | undefined;
  shipping_country: string | undefined;

  shipping_address1: string | undefined;
  shipping_address2?: string | undefined;

  shipping_city: string | undefined;

  email: string | undefined;

  coupon_code: string | null;
}
