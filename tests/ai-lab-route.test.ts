// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { aiLabRoutes } from "../worker/routes/aiLab";
import * as rateLimits from "../worker/rateLimit";
import type { D1PreparedStatement, Env } from "../worker/types";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
function context(origin = "https://forge.test") {
  const bindings: unknown[][] = [];
  const statement: D1PreparedStatement = {
    bind: (...values) => {
      bindings.push(values);
      return statement;
    },
    first: async () => null,
    run: async () => ({ success: true }),
  };
  const env: Env = {
    DB: { prepare: () => statement },
    ASSETS: { fetch: async () => new Response() },
    AI: {
      run: vi.fn(async () => ({
        response: JSON.stringify({
          action: "search",
          query: "reviews",
          limit: 1,
          reason: "Find evidence",
        }),
      })),
    },
  };
  const request = new Request("https://forge.test/api/ai/lab", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({
      action: "plan",
      input: "Find how reviews help",
      source: "Private sample source: reviews improve recall.",
    }),
  });
  return {
    env,
    request,
    requestId: "test",
    url: new URL(request.url),
    user: {
      id: "test-user",
      email: "test@example.test",
      fullName: "Test",
      username: "test",
    },
    bindings,
  };
}
describe("bounded AI lab route", () => {
  it("rejects cross-origin calls before model or quota access", async () => {
    const rate = vi.spyOn(rateLimits, "enforceRateLimit").mockResolvedValue();
    const ctx = context("https://other.test");
    await expect(aiLabRoutes[0].handler(ctx)).rejects.toMatchObject({
      status: 403,
    });
    expect(ctx.env.AI.run).not.toHaveBeenCalled();
    expect(rate).not.toHaveBeenCalled();
  });
  it("shares the established quota and records only usage metadata", async () => {
    const rate = vi.spyOn(rateLimits, "enforceRateLimit").mockResolvedValue();
    const ctx = context();
    const response = await aiLabRoutes[0].handler(ctx);
    expect((await response.json()).plan.action).toBe("search");
    expect(rate).toHaveBeenCalledWith(
      ctx.env,
      ctx.request,
      "ai",
      "test-user",
      20,
      3600,
    );
    expect(JSON.stringify(ctx.bindings)).not.toContain("Private sample source");
    expect(JSON.stringify(ctx.bindings)).not.toContain("Find how reviews help");
  });
  it("does not invoke the model when quota is exhausted", async () => {
    vi.spyOn(rateLimits, "enforceRateLimit").mockRejectedValue(
      new Error("Quota exhausted"),
    );
    const ctx = context();
    await expect(aiLabRoutes[0].handler(ctx)).rejects.toThrow(
      "Quota exhausted",
    );
    expect(ctx.env.AI.run).not.toHaveBeenCalled();
  });
  it("rejects malformed model output without executing tools", async () => {
    vi.spyOn(rateLimits, "enforceRateLimit").mockResolvedValue();
    const ctx = context();
    vi.mocked(ctx.env.AI.run).mockResolvedValue({
      response: '{"action":"delete_all"}',
    });
    await expect(aiLabRoutes[0].handler(ctx)).rejects.toMatchObject({
      status: 502,
      code: "INVALID_LAB_OUTPUT",
    });
    expect(ctx.bindings).toHaveLength(0);
  });
  it("bounds inference response time without claiming provider cancellation", async () => {
    vi.useFakeTimers();
    vi.spyOn(rateLimits, "enforceRateLimit").mockResolvedValue();
    const ctx = context();
    vi.mocked(ctx.env.AI.run).mockImplementation(() => new Promise(() => {}));
    const outcome = expect(aiLabRoutes[0].handler(ctx)).rejects.toMatchObject({
      status: 504,
      code: "LAB_TIMEOUT",
    });
    await vi.advanceTimersByTimeAsync(30001);
    await outcome;
  });
});
