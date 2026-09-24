import { afterEach, describe, expect, it, vi } from "vitest";
import { ForgeApiError, forgeApi } from "../src/services/forgeApi";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Forge API repository", () => {
  it("sends workspace saves through the authenticated JSON boundary", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ revision: 7, updatedAt: "2026-09-25T00:00:00.000Z" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      forgeApi.saveWorkspace({ "src/main.js": "console.log('safe')" }, "src/main.js", 6),
    ).resolves.toEqual({ revision: 7, updatedAt: "2026-09-25T00:00:00.000Z" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [path, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/workspaces/default");
    expect(init.method).toBe("PUT");
    expect(init.credentials).toBe("same-origin");
    expect(new Headers(init.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init.body))).toEqual({
      files: { "src/main.js": "console.log('safe')" },
      activePath: "src/main.js",
      revision: 6,
    });
  });

  it("preserves structured API failures for the interface to recover from", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          { error: { code: "UNAUTHORIZED", message: "Please sign in." } },
          401,
        ),
      ),
    );

    await expect(forgeApi.session()).rejects.toMatchObject<Partial<ForgeApiError>>({
      name: "Error",
      status: 401,
      code: "UNAUTHORIZED",
      message: "Please sign in.",
    });
  });
});
