import {
  getPerformanceConsent,
  PERFORMANCE_CONSENT_EVENT,
  PERFORMANCE_CONSENT_KEY,
} from "../data/performanceConsent";
import { coarseVitalRoute, parseVitalReport } from "../domain/webVitals";
import type { Metric } from "web-vitals";

let started = false;

export async function startPerformanceMonitoring() {
  if (started) return;
  started = true;
  if (!getPerformanceConsent() || typeof PerformanceObserver === "undefined")
    return;
  const route = coarseVitalRoute(location.pathname);
  const device =
    innerWidth < 768 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop";
  let stopped = false;
  const pending = new Set<AbortController>();
  const seen = new Set<string>();
  const stop = () => {
    stopped = true;
    pending.forEach((controller) => controller.abort());
    pending.clear();
  };
  // Every local consent event latches off; enabling takes effect on reload.
  window.addEventListener(PERFORMANCE_CONSENT_EVENT, stop);
  window.addEventListener("storage", (event) => {
    if (
      (event.key === PERFORMANCE_CONSENT_KEY || event.key === null) &&
      !getPerformanceConsent()
    )
      stop();
  });
  const report = (metric: Metric) => {
    if (
      stopped ||
      !getPerformanceConsent() ||
      !navigator.onLine ||
      seen.size >= 30 ||
      seen.has(metric.id)
    )
      return;
    const payload = parseVitalReport({
      version: 1,
      consent: true,
      name: metric.name,
      value: metric.value,
      route,
      device,
    });
    if (!payload) return;
    seen.add(metric.id);
    const controller = new AbortController();
    pending.add(controller);
    const deadline = window.setTimeout(() => controller.abort(), 5000);
    void fetch("/api/v1/metrics/web-vitals", {
      method: "POST",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      keepalive: true,
      signal: controller.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
      .catch(() => undefined)
      .finally(() => {
        window.clearTimeout(deadline);
        pending.delete(controller);
      });
  };
  try {
    const { onCLS, onINP, onLCP } = await import("web-vitals");
    if (stopped || !getPerformanceConsent()) return;
    onCLS(report);
    onINP(report);
    onLCP(report);
  } catch {
    stop(); // Diagnostics must never prevent learning or create retries.
  }
}
