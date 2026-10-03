export const PERFORMANCE_CONSENT_KEY = "forge-performance-consent-v1";
export const PERFORMANCE_CONSENT_EVENT = "forge-performance-consent-change";

export function getPerformanceConsent() {
  try {
    return localStorage.getItem(PERFORMANCE_CONSENT_KEY) === "enabled";
  } catch {
    return false;
  }
}

export function setPerformanceConsent(enabled: boolean) {
  // Notify first on opt-out, even when blocked storage prevents persistence.
  if (!enabled) window.dispatchEvent(new Event(PERFORMANCE_CONSENT_EVENT));
  try {
    localStorage.setItem(
      PERFORMANCE_CONSENT_KEY,
      enabled ? "enabled" : "disabled",
    );
    window.dispatchEvent(new Event(PERFORMANCE_CONSENT_EVENT));
    return true;
  } catch {
    return false;
  }
}
