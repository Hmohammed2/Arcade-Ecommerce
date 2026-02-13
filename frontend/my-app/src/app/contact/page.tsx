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
    <section
      className="
        py-20
        bg-white dark:bg-gray-900
        text-black dark:text-white
        transition-colors
      "
    >
      <div className="mx-auto max-w-7xl px-6">
        <h1
          className="
          mb-4 text-3xl font-bold
          text-black dark:text-white
        "
        >
          Contact Us
        </h1>

        <p
          className="
          mb-8 max-w-2xl
          text-gray-700 dark:text-gray-300
        "
        >
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
    </section>
  );
}
