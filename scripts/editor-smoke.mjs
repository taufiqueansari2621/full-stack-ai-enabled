import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.FORGE_EDITOR_TEST_URL ?? "http://127.0.0.1:5173";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const click = async (text) => {
  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll("button")].some((button) =>
        button.textContent.includes(label),
      ),
    {},
    text,
  );
  await page.evaluate(
    (label) =>
      [...document.querySelectorAll("button")]
        .find((button) => button.textContent.includes(label))
        .click(),
    text,
  );
};
const editor = 'textarea[aria-label="Editing src/index.js"]';
const edit = async (value) => {
  await page.$eval(
    editor,
    (element, text) => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      ).set.call(element, text);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    },
    value,
  );
};

try {
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await click("Start learning");
  const inputs = await page.$$(".profile-form input");
  await inputs[0].type("Editor Verification");
  await inputs[1].type("editor_verification");
  await click("Create profile & start");
  await click("Workspace");
  await page.waitForSelector(editor);
  await edit(
    "function sum(numbers){return numbers.reduce((a,b)=>a+b,0)}\nconsole.log(sum([2,3,4]));",
  );
  await click("Format file");
  await page.waitForFunction(() =>
    document
      .querySelector(".workspace-message")
      ?.textContent.includes("Formatting finished"),
  );
  const formatted = await page.$eval(editor, (element) => element.value);
  assert.ok(formatted.includes("  return numbers.reduce"));
  assert.ok(formatted.includes("sum([2, 3, 4])"));
  assert.ok(await page.$(".syntax-keyword"));
  const styles = await page.evaluate(() => {
    const input = getComputedStyle(
      document.querySelector(".highlighted-editor textarea"),
    );
    const syntax = getComputedStyle(document.querySelector(".syntax-layer"));
    return {
      aligned: input.font === syntax.font && input.padding === syntax.padding,
      background: input.backgroundColor,
    };
  });
  assert.equal(styles.aligned, true);
  assert.equal(styles.background, "rgba(0, 0, 0, 0)");
  await click("Run tests");
  await page.waitForSelector(".solution-explanation");
  await edit("function (");
  await click("Format file");
  await page.waitForFunction(() =>
    /Unexpected token|SyntaxError/.test(
      document.querySelector(".workspace-message")?.textContent ?? "",
    ),
  );
  assert.equal(
    await page.$eval(editor, (element) => element.value),
    "function (",
  );
  await edit("// retain this\n");
  await page.$eval(editor, (element) => {
    element.focus();
    element.setSelectionRange(0, 0);
  });
  await page.select(".editor-tools select", "console.log();");
  assert.equal(
    await page.$eval(editor, (element) => element.value),
    "console.log();// retain this\n",
  );
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `overflow at ${width}px`,
    );
  }
  await page.setViewport({ width: 1440, height: 900 });
  await click("Practice");
  for (const title of [
    "Event loop ordering",
    "Closure reasoning",
    "Find the React state bug",
    "Choose a database index",
  ]) {
    await page.evaluate(
      (text) =>
        [...document.querySelectorAll(".challenge-list button")]
          .find((button) => button.textContent.includes(text))
          .click(),
      title,
    );
    await page.waitForFunction(
      (text) =>
        document.querySelector(".challenge-workspace h2")?.textContent === text,
      {},
      title,
    );
    assert.ok(await page.$(".challenge-contract"));
  }
  await click("Projects");
  await click("Start P05");
  await page.waitForSelector(".project-workspace");
  await page.evaluate(() =>
    [...document.querySelectorAll(".workspace-nav button")]
      .find((button) => button.textContent.includes("Architecture"))
      .click(),
  );
  await page.waitForSelector(
    ".project-workspace .challenge-reflection textarea",
  );
  await page.type(
    ".project-workspace .challenge-reflection textarea",
    "Separate search input, request cancellation, and results rendering. Verify stale responses cannot replace newer results.",
  );
  await click("Save entry");
  await page.waitForFunction(() =>
    document
      .querySelector(".project-workspace")
      ?.textContent.includes("Saved to this project and My Notes"),
  );
  await click("All projects");
  await click("Start P05");
  await page.waitForSelector(".project-workspace");
  await page.evaluate(() =>
    [...document.querySelectorAll(".workspace-nav button")]
      .find((button) => button.textContent.includes("Architecture"))
      .click(),
  );
  await page.waitForFunction(() =>
    document
      .querySelector(".project-workspace .challenge-reflection textarea")
      ?.value.includes("request cancellation"),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Editor verification passed: actual parser formatting, invalid-code preservation, highlighting alignment, cursor insertion, passing explanation, all challenge screens, and four viewport widths.",
  );
} finally {
  await browser.close();
}
