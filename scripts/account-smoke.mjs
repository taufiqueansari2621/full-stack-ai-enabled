import puppeteer from "puppeteer-core";

const baseUrl = process.env.FORGE_ACCOUNT_TEST_URL ?? "http://127.0.0.1:8787";
const marker = Date.now();
const email = `account-${marker}@example.com`;
const username = `account_${String(marker).slice(-10)}`;
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage();
  const errors = [];
  const clickText = async (text) => {
    await page.waitForFunction(
      (label) =>
        [...document.querySelectorAll("button")].some((button) =>
          button.textContent?.includes(label),
        ),
      { timeout: 10_000 },
      text,
    );
    await page.evaluate((label) => {
      const button = [...document.querySelectorAll("button")].find((item) =>
        item.textContent?.includes(label),
      );
      if (!(button instanceof HTMLButtonElement))
        throw new Error(`Button not found: ${label}`);
      button.click();
    }, text);
  };
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await clickText("Sign in to Forge");
  await clickText("New to Forge? Create an account");
  await page.type('input[autocomplete="name"]', "Account Smoke");
  await page.type('input[autocomplete="username"]', username);
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', "account-smoke-password");
  await clickText("Create secure account");
  await page.waitForFunction(
    () => document.body.textContent?.includes("Import my Forge progress"),
    { timeout: 10_000 },
  );
  const recoveryCode = await page.$eval(
    ".recovery-code-banner code",
    (element) => element.textContent ?? "",
  );
  if (!recoveryCode)
    throw new Error("Registration did not reveal a recovery code");
  await clickText("Import my Forge progress");
  await page.waitForFunction(
    async () => {
      const response = await fetch("/api/progress");
      const data = await response.json();
      return response.ok && data.revision >= 1 && data.state?.version === 1;
    },
    { timeout: 10_000 },
  );
  const recoveryResult = await page.evaluate(
    async ({ accountEmail, code }) => {
      await fetch("/api/auth/logout", { method: "POST" });
      const unauthorized = (await fetch("/api/progress")).status;
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: accountEmail,
          recoveryCode: code,
          password: "replacement-account-password",
        }),
      });
      const body = await response.json();
      return {
        unauthorized,
        status: response.status,
        nextCode: body.recoveryCode,
      };
    },
    { accountEmail: email, code: recoveryCode },
  );
  if (recoveryResult.unauthorized !== 401)
    throw new Error(
      `Expected 401 after logout, received ${recoveryResult.unauthorized}`,
    );
  if (recoveryResult.status !== 200 || !recoveryResult.nextCode)
    throw new Error(`Account recovery failed with ${recoveryResult.status}`);
  const loginStatus = await page.evaluate(async (accountEmail) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: accountEmail,
        password: "replacement-account-password",
      }),
    });
    return response.status;
  }, email);
  if (loginStatus !== 200)
    throw new Error(`Login after recovery returned ${loginStatus}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  console.log(
    "Account smoke passed: registration UI, recovery, session renewal, explicit local import, cloud progress, and logout authorization.",
  );
} finally {
  await browser.close();
}
