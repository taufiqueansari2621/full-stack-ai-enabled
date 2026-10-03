import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
const base = process.env.FORGE_VITALS_TEST_URL ?? "http://localhost:8787";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  const errors = [];
  const reports = [];
  const responses = [];
  let sdkRequests = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/\/assets\/web-vitals-/.test(request.url())) sdkRequests++;
    if (request.url().endsWith("/metrics/web-vitals")) {
      assert.ok(!request.headers().cookie);
      assert.ok(!request.headers().referer);
      reports.push(JSON.parse(request.postData()));
    }
  });
  page.on("response", (response) => {
    if (response.url().endsWith("/metrics/web-vitals"))
      responses.push(response.status());
  });
  const clickText = async (text) => {
    await page.waitForFunction(
      (text) =>
        [...document.querySelectorAll("button")].some((button) =>
          button.textContent?.trim().includes(text),
        ),
      {},
      text,
    );
    await page.evaluate(
      (text) =>
        [...document.querySelectorAll("button")]
          .find((button) => button.textContent?.trim().includes(text))
          .click(),
      text,
    );
  };
  await page.goto(base, { waitUntil: "networkidle0" });
  await clickText("Start learning");
  const inputs = await page.$$(".profile-form input");
  await inputs[0].type("Performance Tester");
  await inputs[1].type("performance_tester");
  await clickText("Create profile & start");
  await page.waitForSelector('[aria-label="Open learner settings"]');
  await page.click('[aria-label="Open learner settings"]');
  await page.waitForSelector(".performance-control input");
  assert.equal(
    await page.$eval(".performance-control input", (input) => input.checked),
    false,
  );
  assert.equal(reports.length, 0, "No measurement before consent");
  assert.equal(sdkRequests, 0, "No analytics SDK before consent");
  // Native keyboard interaction verifies the accessible checkbox.
  await page.focus(".performance-control input");
  await page.keyboard.press("Space");
  assert.equal(
    await page.$eval(".performance-control input", (input) => input.checked),
    true,
  );
  assert.equal(reports.length, 0, "Enabling alone must not send");
  assert.equal(sdkRequests, 0, "SDK starts only after reload");
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector('[aria-label="Open learner settings"]');
  await page.click('[aria-label="Open learner settings"]');
  const background = await browser.newPage();
  await background.goto("about:blank");
  await background.bringToFront();
  // Real Chrome observers only: no injected synthetic performance entries.
  const deadline = Date.now() + 15000;
  while (!responses.length && Date.now() < deadline)
    await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(reports.length > 0, "Expected a real native web-vitals sample");
  assert.ok(
    responses.includes(200),
    `Collector statuses: ${responses.join(",")}`,
  );
  for (const report of reports) {
    assert.deepEqual(Object.keys(report).sort(), [
      "consent",
      "device",
      "name",
      "route",
      "value",
      "version",
    ]);
    assert.ok(["LCP", "CLS", "INP"].includes(report.name));
    assert.equal(report.consent, true);
    assert.equal(report.route, "home");
    assert.ok(Number.isFinite(report.value));
  }
  await page.bringToFront();
  await page.waitForSelector(".performance-control input");
  await page.click(".performance-control input");
  const before = reports.length;
  await background.bringToFront();
  await page.bringToFront();
  await page.reload({ waitUntil: "networkidle0" });
  await page.click('[aria-label="Open learner settings"]');
  assert.equal(
    await page.$eval(".performance-control input", (input) => input.checked),
    false,
  );
  for (const width of [375, 768, 1280, 1440]) {
    await page.setViewport({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px overflow`,
    );
    assert.ok(
      await page.$eval(
        ".performance-control",
        (label) => label.getBoundingClientRect().height >= 44,
      ),
    );
    assert.ok(
      await page.$eval(
        ".performance-control",
        (label) => Number.parseFloat(getComputedStyle(label).fontSize) >= 14,
      ),
    );
    assert.ok(
      await page.$eval(
        ".performance-preference span",
        (text) => Number.parseFloat(getComputedStyle(text).fontSize) >= 12,
      ),
    );
    assert.equal(
      await page.$eval(
        ".performance-control",
        (label) => getComputedStyle(label).display,
      ),
      "flex",
    );
    assert.equal(
      await page.$eval(
        ".performance-control",
        (label) => getComputedStyle(label).flexDirection,
      ),
      "row",
    );
  }
  assert.equal(
    reports.length,
    before,
    "Opt-out and reload must stop reporting",
  );
  assert.deepEqual(errors, []);
  if (process.env.FORGE_VITALS_SCREENSHOT) {
    await page.screenshot({ path: process.env.FORGE_VITALS_SCREENSHOT });
  }
  console.log(
    JSON.stringify({
      ok: true,
      realMetricNames: [...new Set(reports.map((report) => report.name))],
      reports: reports.length,
      statuses: responses,
      responsiveWidths: [375, 768, 1280, 1440],
    }),
  );
} finally {
  await browser.close();
}
