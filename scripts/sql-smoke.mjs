import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.FORGE_SQL_TEST_URL ?? "http://127.0.0.1:8787";
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
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  const click = async (label) => {
    await page.waitForFunction(
      (text) =>
        [...document.querySelectorAll("button")].some(
          (b) => b.textContent.includes(text) && !b.disabled,
        ),
      {},
      label,
    );
    await page.evaluate(
      (text) =>
        [...document.querySelectorAll("button")]
          .find((b) => b.textContent.includes(text) && !b.disabled)
          .click(),
      label,
    );
  };
  await click("Start learning");
  const inputs = await page.$$(".profile-form input");
  await inputs[0].type("SQL Verification");
  await inputs[1].type("sql_verification");
  await click("Create profile & start");
  await page.goto(`${baseUrl}/labs`, { waitUntil: "networkidle0" });
  await page.waitForSelector(".lab-tabs");
  await page.evaluate(() =>
    [...document.querySelectorAll(".lab-tabs button")]
      .find((b) => /SQL/i.test(b.textContent))
      .click(),
  );
  const edit = async (value) =>
    page.$eval(
      ".query-editor",
      (el, text) => {
        Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        ).set.call(el, text);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      },
      value,
    );
  const run = async (query) => {
    await edit(query);
    await click("Run query");
    await page.waitForFunction(
      () =>
        document.querySelector(".sql-explanation") ||
        document.querySelector(".sql-error"),
      { timeout: 15000 },
    );
  };
  const rows = () =>
    page.$$eval(".sql-result-table tbody tr", (elements) =>
      elements.map((row) =>
        [...row.querySelectorAll("td")].map((cell) => cell.textContent),
      ),
    );
  const topics = await page.$$eval(".lab-grid select option", (options) =>
    options.map((option) => option.value),
  );
  for (const topic of topics) {
    await page.select(".lab-grid select", topic);
    await click("Run query");
    await page.waitForFunction(
      () =>
        document.querySelector(".sql-explanation") ||
        document.querySelector(".sql-error"),
    );
    assert.equal(
      await page.$(".sql-error"),
      null,
      `SQL topic failed: ${topic}`,
    );
  }
  await run("SELECT name FROM learners WHERE score > 90;");
  assert.deepEqual(await rows(), [["Ada"]]);
  await run("SELECT name FROM learners WHERE score > 100;");
  assert.deepEqual(await rows(), []);
  await run(
    "BEGIN; UPDATE learners SET score=1 WHERE id=1; ROLLBACK; SELECT score FROM learners WHERE id=1;",
  );
  assert.deepEqual(await rows(), [["92"]]);
  await run(
    "BEGIN; UPDATE learners SET score=1 WHERE id=1; COMMIT; SELECT score FROM learners WHERE id=1;",
  );
  assert.deepEqual(await rows(), [["1"]]);
  await run(
    "CREATE INDEX scores ON learners(score); SELECT name FROM learners WHERE score=92;",
  );
  assert.match(
    await page.$eval(".sql-explanation", (el) => el.textContent),
    /USING INDEX scores/,
  );
  await run("SELECT missing FROM learners;");
  assert.match(
    await page.$eval(".sql-error", (el) => el.textContent),
    /missing/,
  );
  await run(
    "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<500) SELECT x FROM n;",
  );
  assert.equal((await rows()).length, 200);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `overflow at ${width}`,
    );
  }
  await run(
    "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n) SELECT sum(x) FROM n;",
  );
  assert.match(
    await page.$eval(".sql-error", (el) => el.textContent),
    /5-second limit/,
  );
  await edit(
    "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n) SELECT sum(x) FROM n;",
  );
  await click("Run query");
  await click("Cancel SQL run");
  await page.waitForSelector(".sql-error");
  assert.match(
    await page.$eval(".sql-error", (el) => el.textContent),
    /cancelled/,
  );
  await run("SELECT 42 AS answer;");
  assert.deepEqual(await rows(), [["42"]]);
  assert.deepEqual(errors, []);
  console.log(
    "Real SQL browser checks passed: filters, empty results, commit/rollback, index plans, errors, output limits, timeout/cancel recovery, and four viewport widths.",
  );
} finally {
  await browser.close();
}
