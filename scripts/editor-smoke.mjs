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
  const fill = async (selector, value) => {
    await page.$eval(
      selector,
      (element, text) => {
        Object.getOwnPropertyDescriptor(
          element.tagName === "TEXTAREA"
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype,
          "value",
        ).set.call(element, text);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      },
      value,
    );
  };
  await click("New file");
  await fill('input[aria-label="New file path"]', "practice/nested/answer.ts");
  await click("Create file");
  await page.waitForSelector(
    'textarea[aria-label="Editing practice/nested/answer.ts"]',
  );
  await fill(
    'textarea[aria-label="Editing practice/nested/answer.ts"]',
    'const learner = { score: 42, name: "Ada" }; learner.sc',
  );
  await page.$eval(
    'textarea[aria-label="Editing practice/nested/answer.ts"]',
    (element) => {
      element.focus();
      element.setSelectionRange(element.value.length, element.value.length);
    },
  );
  await click("Suggest at cursor / check code");
  await page.waitForSelector('select[aria-label="Semantic suggestions"]');
  const scoreOption = await page.$eval(
    'select[aria-label="Semantic suggestions"]',
    (element) =>
      [...element.options].find((option) => option.textContent === "score")
        ?.value,
  );
  assert.ok(scoreOption !== undefined);
  await page.select('select[aria-label="Semantic suggestions"]', scoreOption);
  assert.ok(
    (
      await page.$eval(
        'textarea[aria-label="Editing practice/nested/answer.ts"]',
        (element) => element.value,
      )
    ).endsWith("learner.score"),
  );
  await click("Rename / move");
  await page.select('select[aria-label="File or folder to move"]', "practice");
  await fill('input[aria-label="Destination path"]', "examples");
  await click("Apply move");
  await page.waitForSelector(
    'textarea[aria-label="Editing examples/nested/answer.ts"]',
  );
  await click("Delete file");
  await click("Cancel file operation");
  assert.ok(
    await page.$('textarea[aria-label="Editing examples/nested/answer.ts"]'),
  );
  await click("Delete file");
  await click("Confirm delete");
  assert.equal(
    await page.$('textarea[aria-label="Editing examples/nested/answer.ts"]'),
    null,
  );
  await click("Undo delete");
  await page.waitForSelector(
    'textarea[aria-label="Editing examples/nested/answer.ts"]',
  );
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector(
    'textarea[aria-label="Editing examples/nested/answer.ts"]',
  );
  assert.ok(
    (
      await page.$eval(
        'textarea[aria-label="Editing examples/nested/answer.ts"]',
        (element) => element.value,
      )
    ).endsWith("learner.score"),
  );
  await click("src/index.js");
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
  await click("Open TypeScript exercise");
  const tsEditor = 'textarea[aria-label="Editing src/exercise.ts"]';
  await page.waitForSelector(tsEditor);
  await click("Run tests");
  await page.waitForFunction(
    () =>
      document
        .querySelector(".terminal-output")
        ?.textContent.includes("TypeScript type-check passed") ||
      document.querySelector(".terminal-output .error"),
    { timeout: 20000 },
  );
  assert.ok(
    await page.$eval(".terminal-output", (element) =>
      element.textContent.includes("TypeScript type-check passed"),
    ),
    await page.$eval(".terminal-output", (element) => element.textContent),
  );
  const editTypeScript = async (value) =>
    page.$eval(
      tsEditor,
      (element, text) => {
        Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        ).set.call(element, text);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      },
      value,
    );
  await editTypeScript(
    'const value: number = "wrong"; console.log("SHOULD NOT RUN");',
  );
  await click("Run tests");
  await page.waitForFunction(
    () =>
      document
        .querySelector(".terminal-output")
        ?.textContent.includes("TS2322"),
    { timeout: 20000 },
  );
  assert.equal(
    await page.$eval(".terminal-output", (element) =>
      element.textContent.includes("SHOULD NOT RUN"),
    ),
    false,
  );
  await editTypeScript(
    "function sum(numbers: number[]): number { return numbers.reduce((a, b) => a + b, 0); } console.log(sum([2,3,4]));",
  );
  await click("Run tests");
  await page.waitForFunction(
    () =>
      document
        .querySelector(".terminal-output")
        ?.textContent.includes("TypeScript type-check passed"),
    { timeout: 20000 },
  );
  await click("Tests");
  await page.waitForFunction(() =>
    document
      .querySelector(".terminal-output")
      ?.textContent.includes("3 passed"),
  );
  await editTypeScript("while (true) {}");
  await click("Run tests");
  await editTypeScript("console.log('newer edit');");
  await page.waitForFunction(
    () =>
      document
        .querySelector(".workspace-message")
        ?.textContent.includes("Files changed during execution"),
    { timeout: 20000 },
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
    "Editor verification passed: parser formatting, invalid-code preservation, highlighting alignment, cursor insertion, real TypeScript typechecking/execution and error recovery, passing explanation, persisted project notes, all challenge screens, and four viewport widths.",
  );
} finally {
  await browser.close();
}
