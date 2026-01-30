import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | ArcadeStickLabs",
  description:
    "Contact ArcadeStickLabs for sales enquiries, partnerships, or support. You can also reach us directly at sales@arcadesticklabs.co.uk.",
  alternates: {
    canonical: "https://arcadesticklabs.co.uk/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 dark:bg-gray-900 bg-white">
      <h1 className="mb-4 text-3xl font-bold">Contact Us</h1>

      <p className="mb-8 max-w-2xl text-muted-foreground">
        Have a sales enquiry, partnership idea, or general question? Fill out
        the form below or email us directly at{" "}
        <a
          href="mailto:sales@arcadesticklabs.co.uk"
          className="font-medium text-pink-600 hover:underline"
        >
          sales@arcadesticklabs.co.uk
        </a>
        .
      </p>

      <ContactClient />
    </div>
  );
}
