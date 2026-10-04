import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import puppeteer from "puppeteer-core";

const base = "http://localhost:8787";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const marker = Date.now();
let owner;
const sql = (command) =>
  execFileSync(
    "./node_modules/.bin/wrangler",
    ["d1", "execute", "forge-production", "--local", "--command", command],
    { stdio: "pipe" },
  );
const issue = (purpose, expired = false) => {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  sql(
    `INSERT INTO account_email_tokens(id,user_id,token_hash,purpose,created_at,expires_at) VALUES('${randomBytes(16).toString("hex")}','${owner}','${hash}','${purpose}','${new Date().toISOString()}','${new Date(Date.now() + (expired ? -10000 : 3600000)).toISOString()}')`,
  );
  return token;
};
try {
  const page = await browser.newPage();
  // Isolate repeat runs from previous synthetic IP rate-limit buckets.
  await page.setExtraHTTPHeaders({
    "cf-connecting-ip": `192.0.2.${(marker % 254) + 1}`,
  });
  const visitLink = async (fragment) => {
    await page.goto("about:blank", { waitUntil: "domcontentloaded" });
    await page.goto(`${base}/account/email#${fragment}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".account-email-form");
    await page.waitForFunction(() => window.location.hash === "");
  };
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const registration = await page.evaluate(async (marker) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: `email-smoke-${marker}@example.invalid`,
        fullName: "Email Smoke",
        username: `email_${marker}`,
        password: "email-smoke-password",
      }),
    });
    const body = await response.json();
    return { status: response.status, id: body.user?.id };
  }, marker);
  assert.equal(registration.status, 201);
  owner = registration.id;
  assert.equal(
    await page.evaluate(async () => (await fetch("/api/auth/email")).status),
    200,
  );
  const token = issue("verify");
  for (const width of [375, 768, 1280, 1440]) {
    await page.setViewport({ width, height: 900 });
    await visitLink(`verify=${token}`);
    assert.equal(await page.evaluate(() => window.location.hash === ""), true);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    assert.match(
      await page
        .locator("h1")
        .waitHandle()
        .then((handle) => handle.evaluate((el) => el.textContent)),
      /Verify your email/,
    );
  }
  const before = await page.evaluate(
    async () => (await (await fetch("/api/auth/email")).json()).verifiedAt,
  );
  assert.equal(before, null, "Visiting/scanning must not consume the link");
  await page.focus(".account-email-form .primary-button");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() =>
    document.body.innerText.includes("Email verified."),
  );
  const after = await page.evaluate(
    async () => (await (await fetch("/api/auth/email")).json()).verifiedAt,
  );
  assert.ok(after);
  await visitLink(`verify=${token}`);
  await page.click(".account-email-form .primary-button");
  await page.waitForFunction(() =>
    document.body.innerText.includes("already used"),
  );
  const expired = issue("verify", true);
  await visitLink(`verify=${expired}`);
  await page.click(".account-email-form .primary-button");
  await page.waitForFunction(() => document.body.innerText.includes("expired"));
  const reset = issue("reset");
  await visitLink(`reset=${reset}`);
  await page.type('input[type="password"]', "email-new-password");
  await page.waitForFunction(
    () =>
      !document.querySelector(".account-email-form .primary-button").disabled,
  );
  await page.click(".account-email-form .primary-button");
  await page.waitForFunction(() =>
    document.body.innerText.includes("Password reset."),
  );
  const recovery = await page.$eval(
    ".account-recovery-result code",
    (el) => el.textContent,
  );
  assert.equal(recovery.length, 32);
  assert.equal(
    await page.evaluate(async () => (await fetch("/api/auth/email")).status),
    401,
    "Reset revokes the original session",
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
  await page.screenshot({
    path: "/tmp/forge-email-reset-verified.png",
    fullPage: true,
  });
  const login = await page.evaluate(
    async (email) =>
      (
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password: "email-new-password" }),
        })
      ).status,
    `email-smoke-${marker}@example.invalid`,
  );
  assert.equal(login, 200);
  assert.deepEqual(errors, []);
  console.log(
    "Real local Worker: verification, fragment stripping, scanner-safe confirmation, replay, expiry, reset, session revocation, new password login, keyboard and four widths passed. SMTP delivery separately tested with a fake provider; no inbox receipt claimed.",
  );
} finally {
  if (owner) sql(`DELETE FROM users WHERE id='${owner}'`);
  await browser.close();
}
