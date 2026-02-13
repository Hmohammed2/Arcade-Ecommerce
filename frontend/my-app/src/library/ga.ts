declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const gaEvent = (event: string, params = {}) => {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", event, params);
};
