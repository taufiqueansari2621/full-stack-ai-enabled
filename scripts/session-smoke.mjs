import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const base = process.env.FORGE_SESSION_TEST_URL ?? "http://localhost:8787";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const first = await browser.createBrowserContext();
  const second = await browser.createBrowserContext();
  const page = await first.newPage();
  const other = await second.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const call = (target, path, body, method = "POST") =>
    target.evaluate(
      async ({ path, body, method }) => {
        const response = await fetch(
          path,
          body === undefined
            ? {}
            : {
                method,
                headers: { "content-type": "application/json" },
                body: JSON.stringify(body),
              },
        );
        return { status: response.status, data: await response.json() };
      },
      { path, body, method },
    );
  await page.goto(base, { waitUntil: "networkidle0" });
  assert.equal((await call(page, "/api/auth/sessions")).status, 401);
  assert.equal(
    (await call(page, "/api/auth/sessions/revoke", { scope: "others" })).status,
    401,
  );
  const marker = Date.now();
  const credentials = {
    email: `session-${marker}@example.com`,
    password: "session-smoke-password",
  };
  assert.equal(
    (
      await call(page, "/api/auth/register", {
        ...credentials,
        fullName: "Session Smoke",
        username: `session_${marker}`,
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await call(
        page,
        "/api/profile",
        {
          goal: "full-stack-ai-engineer",
          experience: "some-programming",
          framework: "react",
          target: "first-developer-job",
          dailyMinutes: 60,
          difficulty: "balanced",
          diagnosticAnswers: {},
        },
        "PUT",
      )
    ).status,
    200,
  );
  await other.goto(base, { waitUntil: "networkidle0" });
  const loginOther = async () =>
    assert.equal(
      (await call(other, "/api/auth/login", credentials)).status,
      200,
    );
  await loginOther();
  const list = await call(page, "/api/auth/sessions");
  assert.equal(list.data.sessions.length, 2);
  assert.equal(list.data.sessions[0].current, true);
  assert.doesNotMatch(
    JSON.stringify(list),
    /token_hash|tokenHash|current-token/,
  );
  assert.equal(
    (
      await call(page, "/api/auth/sessions/revoke", {
        scope: "session",
        id: list.data.sessions[0].id,
      })
    ).status,
    200,
  );
  assert.equal(
    (await call(page, "/api/auth/sessions")).data.sessions.length,
    2,
  );
  await page.goto(`${base}/progress`, { waitUntil: "networkidle0" });
  const click = async (label) => {
    await page.waitForFunction(
      (text) =>
        [...document.querySelectorAll("button")].some(
          (b) => b.textContent === text && !b.disabled,
        ),
      {},
      label,
    );
    await page.evaluate(
      (text) =>
        [...document.querySelectorAll("button")]
          .find((b) => b.textContent === text)
          .click(),
      label,
    );
  };
  await click("Load active sessions");
  await click("Revoke this session");
  await click("Cancel revocation");
  assert.equal((await call(other, "/api/auth/sessions")).status, 200);
  await click("Revoke this session");
  await click("Confirm revocation");
  await page.waitForFunction(() =>
    document
      .querySelector('[aria-label="Account security"]')
      ?.textContent.includes("Revocation saved"),
  );
  assert.equal((await call(other, "/api/auth/sessions")).status, 401);
  await loginOther();
  await click("Load active sessions");
  await click("Revoke all other sessions");
  await click("Confirm revocation");
  await page.waitForFunction(() =>
    document
      .querySelector('[aria-label="Account security"]')
      ?.textContent.includes("Revocation saved"),
  );
  assert.equal((await call(other, "/api/auth/sessions")).status, 401);
  assert.equal((await call(page, "/api/auth/sessions")).status, 200);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      true,
      `Overflow at ${width}`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "Session smoke passed: anonymous denial, safe metadata, current protection, confirmation/cancel, targeted and bulk second-context revocation, current authorization and four viewport widths. No AI inference invoked.",
  );
} finally {
  await browser.close();
}
