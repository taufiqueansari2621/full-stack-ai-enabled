import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
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
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      request.url().endsWith("/api/auth/login") &&
      request.method() === "POST"
    )
      void request.respond({
        status: 503,
        contentType: "text/plain",
        body: "Your worker exceeded an upstream limit; private infrastructure detail",
      });
    else void request.continue();
  });
  await page.goto("http://localhost:8787", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some((button) =>
      button.textContent.includes("Sign in to Forge"),
    ),
  );
  await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .find((button) => button.textContent.includes("Sign in to Forge"))
      .click(),
  );
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', "outage-check@example.invalid");
  await page.type('input[type="password"]', "synthetic-password");
  await page.waitForFunction(
    () => !document.querySelector(".profile-card .primary-button").disabled,
  );
  await page.click(".profile-card .primary-button");
  await page.waitForFunction(() =>
    document.body.innerText.includes(
      "Forge received an unreadable service response.",
    ),
  );
  assert.equal(
    await page.evaluate(() =>
      document.body.innerText.includes("private infrastructure detail"),
    ),
    false,
  );
  for (const width of [375, 768, 1280, 1440]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
  }
  await page.focus(".profile-card .primary-button");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.matches(".profile-card .primary-button"),
    ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Mocked upstream outage: safe readable error, retry control, keyboard, four widths and no browser errors passed. No cloud account created.",
  );
} finally {
  await browser.close();
}
