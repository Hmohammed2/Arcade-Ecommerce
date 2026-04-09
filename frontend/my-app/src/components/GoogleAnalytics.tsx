"use client";

import Script from "next/script";

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;

          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
