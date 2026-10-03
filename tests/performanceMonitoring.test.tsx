import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PerformancePreference } from "../src/PerformancePreference";
import {
  getPerformanceConsent,
  setPerformanceConsent,
  PERFORMANCE_CONSENT_KEY,
} from "../src/data/performanceConsent";
const sdk = vi.hoisted(() => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
}));
vi.mock("web-vitals", () => sdk);
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  Object.values(sdk).forEach((mock) => mock.mockReset());
  vi.stubGlobal("PerformanceObserver", class {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response()));
});
afterEach(() => {
  setPerformanceConsent(false);
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const start = async () => {
  const { startPerformanceMonitoring } =
    await import("../src/services/performanceMonitoring");
  await startPerformanceMonitoring();
  return startPerformanceMonitoring;
};
it("defaults off, does not register observers and enabling waits for reload", async () => {
  const bootstrap = await start();
  render(<PerformancePreference />);
  const control = screen.getByRole("checkbox", { name: "Share performance" });
  expect((control as HTMLInputElement).checked).toBe(false);
  fireEvent.click(control);
  expect(getPerformanceConsent()).toBe(true);
  expect(screen.getByRole("status").textContent).toContain("Reload");
  await bootstrap();
  expect(sdk.onLCP).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it("loads once, scrubs SDK attribution, deduplicates and uses credential-free requests", async () => {
  setPerformanceConsent(true);
  const bootstrap = await start();
  await bootstrap();
  expect(sdk.onLCP).toHaveBeenCalledTimes(1);
  const callback = sdk.onLCP.mock.calls[0][0];
  const metric = {
    name: "LCP",
    value: 1234.567,
    id: "local-id",
    entries: [{ private: "content" }],
    attribution: { url: "private" },
  };
  callback(metric);
  callback(metric);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    "/api/v1/metrics/web-vitals",
    expect.objectContaining({
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true,
    }),
  );
  const options = vi.mocked(fetch).mock.calls[0][1]!;
  expect(JSON.parse(options.body as string)).toEqual({
    version: 1,
    consent: true,
    name: "LCP",
    value: 1234.6,
    route: "home",
    device: "desktop",
  });
});
it("opt-out aborts pending requests and re-enabling cannot send until reload", async () => {
  setPerformanceConsent(true);
  vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
  await start();
  const callback = sdk.onLCP.mock.calls[0][0];
  callback({ name: "LCP", value: 500, id: "one" });
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!;
  setPerformanceConsent(false);
  expect(signal.aborted).toBe(true);
  setPerformanceConsent(true);
  callback({ name: "LCP", value: 600, id: "two" });
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("cross-tab removal stops callbacks", async () => {
  setPerformanceConsent(true);
  await start();
  localStorage.removeItem(PERFORMANCE_CONSENT_KEY);
  window.dispatchEvent(
    new StorageEvent("storage", { key: PERFORMANCE_CONSENT_KEY }),
  );
  sdk.onLCP.mock.calls[0][0]({ name: "LCP", value: 500, id: "one" });
  expect(fetch).not.toHaveBeenCalled();
});
it("storage failures fail closed and report a recoverable preference error", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(getPerformanceConsent()).toBe(false);
  render(<PerformancePreference />);
  fireEvent.click(screen.getByRole("checkbox"));
  expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(
    false,
  );
  expect(screen.getByRole("status").textContent).toContain("Could not save");
});
it("unsupported observers stay silent", async () => {
  setPerformanceConsent(true);
  vi.stubGlobal("PerformanceObserver", undefined);
  await start();
  expect(sdk.onLCP).not.toHaveBeenCalled();
});
it("bounds sends and aborts requests after five seconds", async () => {
  setPerformanceConsent(true);
  vi.useFakeTimers();
  vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
  await start();
  const callback = sdk.onLCP.mock.calls[0][0];
  for (let i = 0; i < 40; i++)
    callback({ name: "LCP", value: 500, id: `metric-${i}` });
  expect(fetch).toHaveBeenCalledTimes(30);
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!;
  vi.advanceTimersByTime(5000);
  expect(signal.aborted).toBe(true);
});
it("offline and malformed metrics do not send and failures are not retried", async () => {
  setPerformanceConsent(true);
  await start();
  const callback = sdk.onLCP.mock.calls[0][0];
  callback({ name: "LCP", value: Infinity, id: "bad" });
  const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  callback({ name: "LCP", value: 500, id: "offline" });
  expect(fetch).not.toHaveBeenCalled();
  online.mockRestore();
  vi.mocked(fetch).mockRejectedValue(new Error("unavailable"));
  callback({ name: "LCP", value: 500, id: "failed" });
  await Promise.resolve();
  await Promise.resolve();
  expect(fetch).toHaveBeenCalledTimes(1);
});
