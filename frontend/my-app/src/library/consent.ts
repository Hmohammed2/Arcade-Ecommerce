export type ConsentState = "granted" | "denied";

export const CONSENT_COOKIE_KEY = "asl_cookie_consent";

export type SavedConsent = {
  analytics: ConsentState;
  updatedAt: string;
};

export function readStoredConsent(): SavedConsent | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(CONSENT_COOKIE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SavedConsent;
  } catch {
    return null;
  }
}

export function saveConsent(consent: SavedConsent) {
  localStorage.setItem(CONSENT_COOKIE_KEY, JSON.stringify(consent));
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

export function applyConsent(analytics: ConsentState) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  window.gtag("consent", "update", {
    analytics_storage: analytics,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
