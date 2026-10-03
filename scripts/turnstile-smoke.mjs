import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
const base = process.env.FORGE_SECURITY_TEST_URL ?? "http://localhost:8787";
const live = process.env.FORGE_SECURITY_LIVE === "1";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let widgetCount = 0;
  if (!live) {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().endsWith("/api/auth/config"))
        return void request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ turnstileSiteKey: "mock-public" }),
        });
      if (
        request
          .url()
          .startsWith("https://challenges.cloudflare.com/turnstile/v0/api.js")
      ) {
        widgetCount++;
        return void request.respond({
          status: 200,
          contentType: "application/javascript",
          body: `
          window.turnstile = {
            render(element, options) {
              window.securityOptions = options;
              window.widgetRenders = (window.widgetRenders || 0) + 1;
              element.textContent = 'Mock security widget'; return 'mock-widget';
            }, remove() {}
          };
        `,
        });
      }
      if (
        request.url().endsWith("/api/auth/login") &&
        request.method() === "POST"
      ) {
        assert.equal(
          JSON.parse(request.postData()).turnstileToken,
          "mock-token",
        );
        return void request.respond({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Incorrect test credentials.",
            },
          }),
        });
      }
      void request.continue();
    });
  }
  const click = async (text) => {
    await page.waitForFunction(
      (label) =>
        [...document.querySelectorAll("button")].some(
          (button) => button.textContent?.trim() === label,
        ),
      {},
      text,
    );
    await page.evaluate(
      (label) =>
        [...document.querySelectorAll("button")]
          .find((button) => button.textContent?.trim() === label)
          .click(),
      text,
    );
  };
  await page.goto(base, { waitUntil: "networkidle0" });
  await click("Sign in to Forge");
  await page.waitForSelector(".account-challenge");
  if (live) {
    await page.waitForFrame(
      (frame) => frame.url().startsWith("https://challenges.cloudflare.com/"),
      { timeout: 30000 },
    );
    const checks = await page.evaluate(async () => {
      const config = await fetch("/api/auth/config").then((response) =>
        response.json(),
      );
      const rejected = [];
      for (const action of ["register", "login", "recover"]) {
        const response = await fetch(`/api/auth/${action}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: `security-${Date.now()}@example.invalid`,
          }),
        });
        rejected.push({
          status: response.status,
          code: (await response.json()).error?.code,
        });
      }
      return { config, rejected };
    });
    assert.deepEqual(Object.keys(checks.config), ["turnstileSiteKey"]);
    assert.ok(checks.config.turnstileSiteKey);
    assert.deepEqual(
      checks.rejected,
      Array.from({ length: 3 }, () => ({
        status: 400,
        code: "CHALLENGE_REQUIRED",
      })),
    );
    console.log(
      "LIVE: real managed widget rendered; all three account endpoints rejected missing tokens. Human challenge completion is not asserted.",
    );
  } else {
    await page.waitForFunction(() => window.securityOptions);
    assert.equal(
      await page.$eval('button[type="submit"]', (button) => button.disabled),
      true,
    );
    await page.type('input[type="email"]', "security@example.invalid");
    await page.type('input[type="password"]', "not-a-real-password");
    await page.evaluate(() => window.securityOptions.callback("mock-token"));
    await page.waitForFunction(
      () => !document.querySelector('button[type="submit"]').disabled,
    );
    assert.equal(
      await page.$eval('button[type="submit"]', (button) => button.disabled),
      false,
    );
    await click("Sign in");
    await page.waitForFunction(() => window.widgetRenders === 2);
    assert.equal(
      await page.$eval('button[type="submit"]', (button) => button.disabled),
      true,
    );
    await page.evaluate(() => window.securityOptions["expired-callback"]());
    await click("Retry security check");
    await page.waitForFunction(() => window.widgetRenders === 3);
    assert.equal(widgetCount, 1);
    console.log(
      "MOCK CLIENT: token-gated submit, payload, fresh widget after rejected login, expiry/retry and singleton SDK passed.",
    );
  }
  for (const width of [375, 768, 1280, 1440]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `Overflow at ${width}px`,
    );
    await page.keyboard.press("Tab");
  }
  assert.deepEqual(errors, []);
  console.log(
    "Account security responsive checks and page-error checks passed.",
  );
} finally {
  await browser.close();
}
