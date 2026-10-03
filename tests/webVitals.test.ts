// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import {
  coarseVitalRoute,
  parseVitalReport,
  vitalRating,
} from "../src/domain/webVitals";
import { webVitalRoutes } from "../worker/routes/webVitals";
import * as quota from "../worker/rateLimit";
import type { Env } from "../worker/types";

const sample = {
  version: 1,
  consent: true,
  name: "LCP",
  value: 1500,
  route: "home",
  device: "desktop",
};
afterEach(() => vi.restoreAllMocks());
const invoke = (
  body: unknown,
  origin: string | null = "https://forge.test",
  type = "application/json",
) => {
  const request = new Request("https://forge.test/api/v1/metrics/web-vitals", {
    method: "POST",
    headers: { ...(origin ? { origin } : {}), "content-type": type },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return webVitalRoutes[0].handler({
    request,
    url: new URL(request.url),
    env: {} as Env,
    requestId: "private-id",
    user: null,
  });
};
it("removes profile and credential identifiers from coarse routes", () => {
  expect(coarseVitalRoute("/u/private-user")).toBe("public-profile");
  expect(coarseVitalRoute("/certificate/private-id")).toBe("certificate");
  expect(coarseVitalRoute("/learn/private-topic")).toBe("other");
  expect(coarseVitalRoute("/")).toBe("home");
});
it.each([
  { ...sample, consent: false },
  { ...sample, version: 2 },
  { ...sample, name: "FCP" },
  { ...sample, value: NaN },
  { ...sample, value: Infinity },
  { ...sample, value: -1 },
  { ...sample, value: 60001 },
  { ...sample, name: "CLS", value: 11 },
  { ...sample, route: "/u/private-user" },
  { ...sample, device: "raw-user-agent" },
  { ...sample, email: "private" },
  { ...sample, id: "private" },
  null,
  [],
])("rejects malformed or identifying payload %j", (data) =>
  expect(parseVitalReport(data)).toBeNull(),
);
it.each([
  ["LCP", 2500, "good"],
  ["LCP", 4000, "needs-improvement"],
  ["LCP", 4001, "poor"],
  ["INP", 200, "good"],
  ["INP", 500, "needs-improvement"],
  ["INP", 501, "poor"],
  ["CLS", 0.1, "good"],
  ["CLS", 0.25, "needs-improvement"],
  ["CLS", 0.251, "poor"],
])("derives %s rating at %s", (name, value, rating) => {
  expect(vitalRating(parseVitalReport({ ...sample, name, value })!)).toBe(
    rating,
  );
});
it.each([null, "https://attacker.test"])(
  "requires exact Origin (%s)",
  async (origin) => {
    await expect(invoke(sample, origin)).rejects.toMatchObject({ status: 403 });
  },
);
it("requires JSON, bounded body and exact schema before quota or logging", async () => {
  const limiter = vi.spyOn(quota, "enforceRateLimit").mockResolvedValue();
  const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
  await expect(
    invoke(sample, "https://forge.test", "text/plain"),
  ).rejects.toMatchObject({ status: 415 });
  await expect(invoke("x".repeat(4097))).rejects.toMatchObject({ status: 413 });
  await expect(invoke("{")).rejects.toMatchObject({ status: 400 });
  await expect(invoke({ ...sample, account: "private" })).rejects.toMatchObject(
    { status: 400 },
  );
  expect(limiter).not.toHaveBeenCalled();
  expect(log).not.toHaveBeenCalled();
});
it("logs only selected metric fields after quota approval with no learner DB access", async () => {
  const limiter = vi.spyOn(quota, "enforceRateLimit").mockResolvedValue();
  const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
  const response = await invoke(sample);
  expect(await response.json()).toEqual({ ok: true });
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(limiter).toHaveBeenCalledWith(
    {},
    expect.any(Request),
    "web-vitals",
    "browser",
    60,
    3600,
  );
  expect(log).toHaveBeenCalledWith({
    service: "forge-ai-engineering",
    event: "client_web_vital",
    timestamp: expect.any(String),
    clientReported: true,
    version: 1,
    name: "LCP",
    value: 1500,
    route: "home",
    device: "desktop",
    rating: "good",
  });
});
it("does not log rate-limited reports", async () => {
  vi.spyOn(quota, "enforceRateLimit").mockRejectedValue({ status: 429 });
  const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
  await expect(invoke(sample)).rejects.toMatchObject({ status: 429 });
  expect(log).not.toHaveBeenCalled();
});
