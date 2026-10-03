import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
const base = process.env.FORGE_DIAGNOSTICS_TEST_URL ?? "http://127.0.0.1:5173";
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
  const click = async (text) => {
    await page.waitForFunction(
      (label) =>
        [...document.querySelectorAll("button")].some(
          (button) =>
            button.textContent?.trim().includes(label) && !button.disabled,
        ),
      {},
      text,
    );
    await page.evaluate(
      (label) =>
        [...document.querySelectorAll("button")]
          .find(
            (button) =>
              button.textContent?.trim().includes(label) && !button.disabled,
          )
          .click(),
      text,
    );
  };
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    const cache = await caches.open("forge-shell-v1");
    await cache.put(
      "/runner-worker.js",
      new Response(
        "self.onmessage = () => self.postMessage({logs: [], results: [], error: 'stale cached runner', executionMs: 0});",
        { headers: { "content-type": "application/javascript" } },
      ),
    );
  });
  await click("Start learning");
  const inputs = await page.$$(".profile-form input");
  await inputs[0].type("Diagnostics Tester");
  await inputs[1].type("diagnostics_test");
  await click("Create profile & start");
  await click("Workspace");
  const editor = 'textarea[aria-label="Editing src/index.js"]';
  await page.waitForSelector(editor);
  const run = async (code, expected) => {
    await page.$eval(
      editor,
      (element, code) => {
        Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        ).set.call(element, code);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      },
      code,
    );
    await click("Run tests");
    await page.waitForFunction(
      () =>
        ![...document.querySelectorAll("button")].some((button) =>
          button.textContent?.includes("Running…"),
        ),
    );
    await click("Tests");
    await page.waitForFunction(
      (text) =>
        document.querySelector(".terminal-output")?.textContent.includes(text),
      {},
      expected,
    );
    assert.equal(
      await page.$$eval(".test-case-results li", (elements) => elements.length),
      3,
    );
  };
  await run("function sum() { return 9; }", "2 failed");
  const partial = await page.$eval(
    ".test-case-results",
    (element) => element.textContent,
  );
  assert.match(partial, /supports negative numbers: Failed/);
  assert.match(partial, /Expected: 2 · Actual: 9/);
  await run("const answer = 9;", "Define a function named sum");
  await run(
    "function sum() { throw new Error('case crashed'); }",
    "case crashed",
  );
  await run("function sum( {", "3 not run");
  assert.match(
    await page.$eval(".test-case-results", (element) => element.textContent),
    /SyntaxError/,
  );
  await run(
    "self.postMessage({ forged: true }); function sum() { return 9; }",
    "invalid or oversized",
  );
  await run("while (true) {}", "Execution stopped after 1.5 seconds.");
  await run(
    "function sum(values) { return values.reduce((total, value) => total + value, 0); }",
    "3 passed",
  );
  assert.match(
    await page.$eval(".test-case-results", (element) => element.textContent),
    /handles an empty array: Passed/,
  );
  for (const width of [375, 768, 1280, 1440]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `Overflow at ${width}px`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "Diagnostics smoke passed: per-case expected/actual, partial success, missing/thrown functions, syntax errors, forged messages, timeout/recovery and four widths. Public browser tests, not a private judge.",
  );
} finally {
  await browser.close();
}
