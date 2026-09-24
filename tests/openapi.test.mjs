import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { normalizeApiPath } from "../worker/apiVersion.ts";
import { OPENAPI_DOCUMENT, openApiRoutes } from "../worker/openapi.ts";

test("the OpenAPI document covers every registered route and method", async () => {
  const routeFiles = (
    await readdir(new URL("../worker/routes/", import.meta.url))
  )
    .filter((name) => name.endsWith(".ts"))
    .map((name) => new URL(`../worker/routes/${name}`, import.meta.url));
  const sources = await Promise.all([
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/openapi.ts", import.meta.url), "utf8"),
    ...routeFiles.map((file) => readFile(file, "utf8")),
  ]);
  const registered = sources.flatMap((source) =>
    [
      ...source.matchAll(/method:\s*"([A-Z]+)"[\s\S]*?pattern:\s*"([^\"]+)"/g),
    ].map(([, method, pattern]) => ({ method, pattern })),
  );

  assert.ok(registered.length >= 20);
  for (const route of registered) {
    const path = route.pattern.replace(/^\/api/, "");
    const operation =
      OPENAPI_DOCUMENT.paths[path]?.[route.method.toLowerCase()];
    assert.ok(
      operation,
      `${route.method} ${route.pattern} is missing from the v1 OpenAPI contract`,
    );
  }
});

test("v1 aliases normalize without changing legacy API paths", () => {
  assert.equal(normalizeApiPath("/api/v1/progress"), "/api/progress");
  assert.equal(
    normalizeApiPath("/api/v1/workspace-snapshots"),
    "/api/workspace-snapshots",
  );
  assert.equal(normalizeApiPath("/api/progress"), "/api/progress");
});

test("the OpenAPI route serves a cacheable v1 contract", async () => {
  const response = await openApiRoutes[0].handler();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control") ?? "", /max-age=300/);
  assert.equal((await response.json()).info.version, "1.0.0");
});
