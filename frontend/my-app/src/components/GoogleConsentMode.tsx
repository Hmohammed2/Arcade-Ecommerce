"use client";

import Script from "next/script";
import { readStoredConsent } from "@/library/consent";

export default function GoogleConsentMode() {
  return (
    <Script id="google-consent-mode" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;

        (function() {
          try {
            var raw = localStorage.getItem("asl_cookie_consent");
            var parsed = raw ? JSON.parse(raw) : null;
            var analytics = parsed?.analytics === "granted" ? "granted" : "denied";

            gtag("consent", "default", {
              analytics_storage: analytics,
              ad_storage: "denied",
              ad_user_data: "denied",
              ad_personalization: "denied"
            });
          } catch (e) {
            gtag("consent", "default", {
              analytics_storage: "denied",
              ad_storage: "denied",
              ad_user_data: "denied",
              ad_personalization: "denied"
            });
          }
        })();
      `}
    </Script>
  );
}
