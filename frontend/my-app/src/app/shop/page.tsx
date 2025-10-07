import type { Metadata } from "next";
import ShopPage from "./ShopPage";

export const metadata: Metadata = {
  title: "Shop Arcade Parts UK — ArcadeStickLabs",
  description:
    "Buy curated arcade parts and fightstick kits in the UK. Fast UK shipping with premium Sanwa, Seimitsu, and Brook components.",
};

export default function Page() {
  return <ShopPage />;
}
