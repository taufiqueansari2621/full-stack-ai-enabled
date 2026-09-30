import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
const base = process.env.FORGE_FRAMEWORK_TEST_URL ?? "http://localhost:8787";
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
          (b) => b.textContent?.trim().includes(label) && !b.disabled,
        ),
      {},
      text,
    );
    await page.evaluate(
      (label) =>
        [...document.querySelectorAll("button")]
          .find((b) => b.textContent?.trim().includes(label) && !b.disabled)
          .click(),
      text,
    );
  };
  const fill = async (selector, value) =>
    page.$eval(
      selector,
      (element, value) => {
        Object.getOwnPropertyDescriptor(
          element.tagName === "TEXTAREA"
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype,
          "value",
        ).set.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      },
      value,
    );
  await page.goto(base, { waitUntil: "networkidle0" });
  await click("Start learning");
  const inputs = await page.$$(".profile-form input");
  await inputs[0].type("Framework Tester");
  await inputs[1].type("framework_test");
  await click("Create profile & start");
  await click("Workspace");
  const build = async () => {
    await click("Preview");
    await click("Build framework preview");
    try {
      await page.waitForSelector('iframe[title="Isolated framework preview"]', {
        timeout: 15000,
      });
    } catch (error) {
      throw new Error(
        await page.$eval(".framework-preview", (e) => e.textContent),
        { cause: error },
      );
    }
    const element = await page.$('iframe[title="Isolated framework preview"]');
    return element.contentFrame();
  };
  for (const framework of ["react", "angular"]) {
    await click("New project");
    await fill(".workspace-dialog-form input", `Real ${framework}`);
    await page.select(".workspace-dialog-form select", framework);
    await click("Create project");
    let frame = await build();
    try {
      await frame.waitForSelector("h1", { timeout: 15000 });
    } catch (error) {
      throw new Error(
        await page.$eval(".framework-preview", (e) => e.textContent),
        { cause: error },
      );
    }
    assert.equal(
      await frame.$eval("h1", (e) => e.textContent),
      `Real ${framework}`,
    );
    const isolated = await frame.evaluate(() => {
      try {
        return parent.document.body.textContent !== null;
      } catch {
        return false;
      }
    });
    assert.equal(isolated, false);
    const networkBlocked = await frame.evaluate(async () => {
      try {
        await fetch("/api/me");
        return false;
      } catch {
        return true;
      }
    });
    assert.equal(networkBlocked, true);
    const path =
      framework === "react" ? "src/App.jsx" : "src/app/app.component.ts";
    await click(path);
    const source =
      framework === "react"
        ? 'import {useState} from "react"; export default function App(){ const [n,setN]=useState(0); return <button onClick={()=>setN(n+1)}>Count {n}</button>; }'
        : 'import {Component, signal} from "@angular/core"; @Component({selector:"app-root",standalone:true,template:`<button (click)="n.set(n()+1)">Count {{n()}}</button>`}) export class AppComponent { n=signal(0); }';
    await fill(`textarea[aria-label="Editing ${path}"]`, source);
    assert.equal(
      await page.$('iframe[title="Isolated framework preview"]'),
      null,
    );
    frame = await build();
    await frame.waitForSelector("button");
    await frame.click("button");
    await frame.waitForFunction(
      () => document.querySelector("button")?.textContent === "Count 1",
    );
    await fill(
      `textarea[aria-label="Editing ${path}"]`,
      'import x from "not-approved"; console.log(x);',
    );
    await click("Build framework preview");
    await page.waitForFunction(() =>
      document
        .querySelector(".framework-preview [role=alert]")
        ?.textContent.includes("not in the preview package allowlist"),
    );
    assert.equal(
      await page.$('iframe[title="Isolated framework preview"]'),
      null,
    );
    await fill(`textarea[aria-label="Editing ${path}"]`, 'throw new Error("Expected preview failure"); export const placeholder = 1;');
    await build();
    await page.waitForFunction(() => document.querySelector(".framework-preview [role=alert]")?.textContent.includes("Expected preview failure"));
    await fill(`textarea[aria-label="Editing ${path}"]`, source);
    frame = await build();
    await frame.waitForSelector("button");
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewport({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
        `Overflow: ${framework} ${width}`,
      );
    }
    await page.setViewport({ width: 1440, height: 900 });
    await click("Stop preview");
    assert.equal(
      await page.$('iframe[title="Isolated framework preview"]'),
      null,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "Framework smoke passed: real React/Angular starters, JSX and decorators, local templates, state/signal updates, blocked parent access/fetch, stale output removal, rejected imports, rebuild/stop and four viewport widths. No AI/provider calls.",
  );
} finally {
  await browser.close();
}
