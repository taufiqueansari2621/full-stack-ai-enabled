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
  await clickText("Full Stack AI Engineer");
  await clickText("Continue");
  await clickText("Some Programming Experience");
  await clickText("Continue");
  await clickText("React");
  await clickText("Continue");
  await clickText("1 hour/day");
  await clickText("Continue");
  await clickText("Get my first developer job");
  await clickText("Continue");
  const diagnosticAnswers = [
    "Semantic HTML elements",
    "The Promise microtask",
    "Unknown must be narrowed before use",
    "The server from a verified session",
    "Faster reads can cost storage and write work",
    "Measure retrieval and answer quality",
  ];
  for (const answer of diagnosticAnswers) {
    await page.evaluate((label) => {
      const target = [...document.querySelectorAll("label")].find((item) =>
        item.textContent?.includes(label),
      );
      const input = target?.querySelector("input");
      if (!(input instanceof HTMLInputElement))
        throw new Error(`Answer not found: ${label}`);
      input.click();
    }, answer);
  }
  const buildDisabled = await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((item) =>
      item.textContent?.includes("Build my roadmap"),
    );
    return button instanceof HTMLButtonElement ? button.disabled : "missing";
  });
  if (buildDisabled)
    throw new Error(`Roadmap action unavailable: ${buildDisabled}`);
  await clickText("Build my roadmap");
  try {
    await clickText("Open my Forge dashboard");
  } catch (error) {
    const body = await page.evaluate(() =>
      document.body.textContent?.slice(0, 1200),
    );
    throw new Error(`Roadmap result missing. Page contained: ${body}`, {
      cause: error,
    });
  }
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
  await clickText("Workspace");
  await page.waitForSelector('textarea[aria-label="Editing src/index.js"]');
  const solution =
    "function sum(numbers) { return numbers.reduce((total, value) => total + value, 0); }\nconsole.log(sum([2, 3, 4]));";
  await page.$eval(
    'textarea[aria-label="Editing src/index.js"]',
    (element, nextValue) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(element, nextValue);
      element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertText",
          data: nextValue,
        }),
      );
    },
    solution,
  );
  await page.waitForFunction(
    (expected) =>
      document.querySelector('textarea[aria-label="Editing src/index.js"]')
        ?.value === expected,
    { timeout: 5_000 },
    solution,
  );
  await clickText("Run tests");
  await page.waitForFunction(
    () => document.body.textContent?.includes("Execution:"),
    { timeout: 10_000 },
  );
  await clickText("Tests");
  try {
    await page.waitForFunction(
      () => document.body.textContent?.includes("3 passed"),
      { timeout: 10_000 },
    );
  } catch (error) {
    const workspaceText = await page.evaluate(
      () => document.querySelector(".workspace-bottom")?.textContent,
    );
    await clickText("Output");
    const outputText = await page.evaluate(
      () => document.querySelector(".terminal-output")?.textContent,
    );
    const editorText = await page.$eval(
      'textarea[aria-label="Editing src/index.js"]',
      (element) => element.value,
    );
    throw new Error(
      `Workspace tests did not pass: ${workspaceText}; output=${outputText}; editor=${editorText}`,
      {
        cause: error,
      },
    );
  }
  await page.waitForFunction(
    async () => {
      const response = await fetch("/api/workspaces/default");
      const data = await response.json();
      return (
        response.ok &&
        data.revision >= 1 &&
        data.files?.["src/index.js"]?.includes("reduce")
      );
    },
    { timeout: 10_000 },
  );
  await clickText("Versions");
  await page.type(".snapshot-create input", "Passing sum implementation");
  await clickText("Save snapshot");
  await page.waitForFunction(
    async () => {
      const response = await fetch("/api/workspace-snapshots");
      const data = await response.json();
      return (
        response.ok &&
        data.snapshots?.some(
          (item) => item.label === "Passing sum implementation",
        )
      );
    },
    { timeout: 10_000 },
  );
  await page.click('button[aria-label="Close dialog"]');
  await page.type(
    'textarea[aria-label="Ask Forge AI"]',
    "Give me one guiding question about why zero is a useful starting total.",
  );
  await clickText("Ask Forge AI");
  await page.waitForFunction(
    () =>
      (document.querySelector(".ai-response p")?.textContent?.length ?? 0) > 20,
    { timeout: 30_000 },
  );
  const aiActions = await page.evaluate(() =>
    [...document.querySelectorAll(".ai-response-actions button")].map(
      (button) => button.textContent?.trim(),
    ),
  );
  for (const action of [
    "Explain simpler",
    "Go deeper",
    "Give example",
    "Quiz me",
    "Practice this",
    "Open related lesson",
    "Copy response",
    "Regenerate",
  ])
    if (!aiActions.includes(action))
      throw new Error(`Forge AI response action is missing: ${action}`);
  const noteAiResult = await page.evaluate(async () => {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: "explain",
        message: "Explain the key idea in this saved note.",
        level: 2,
        context: {
          note: "A reducer combines each value with an accumulated result.",
        },
      }),
    });
    return { status: response.status, body: await response.json() };
  });
  if (
    noteAiResult.status !== 200 ||
    !noteAiResult.body.contextIncluded?.includes("note")
  ) {
    throw new Error(
      `Note AI context failed: ${noteAiResult.status} ${JSON.stringify(noteAiResult.body)}`,
    );
  }
  await clickText("Portfolio");
  await page.waitForSelector(".portfolio-editor textarea", { timeout: 10_000 });
  await page.type(
    ".portfolio-editor textarea",
    "I build accessible full-stack learning products and verify decisions with tests, evidence, and production feedback.",
  );
  await clickText("Publish profile");
  await page.waitForFunction(
    () => document.body.textContent?.includes("View public profile"),
    { timeout: 10_000 },
  );
  const publicPortfolioStatus = await page.evaluate(
    async (name) =>
      (await fetch(`/api/public-profile?username=${encodeURIComponent(name)}`))
        .status,
    username,
  );
  if (publicPortfolioStatus !== 200)
    throw new Error(`Public portfolio returned ${publicPortfolioStatus}`);
  const recoveryResult = await page.evaluate(
    async ({ accountEmail, accountUsername, code }) => {
      await fetch("/api/auth/logout", { method: "POST" });
      const unauthorized = (await fetch("/api/progress")).status;
      const snapshotsUnauthorized = (await fetch("/api/workspace-snapshots"))
        .status;
      const portfolioUnauthorized = (await fetch("/api/portfolio")).status;
      const publicStatus = (
        await fetch(
          `/api/public-profile?username=${encodeURIComponent(accountUsername)}`,
        )
      ).status;
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
        snapshotsUnauthorized,
        portfolioUnauthorized,
        publicStatus,
        status: response.status,
        nextCode: body.recoveryCode,
      };
    },
    { accountEmail: email, accountUsername: username, code: recoveryCode },
  );
  if (recoveryResult.unauthorized !== 401)
    throw new Error(
      `Expected 401 after logout, received ${recoveryResult.unauthorized}`,
    );
  if (recoveryResult.snapshotsUnauthorized !== 401)
    throw new Error(
      `Expected snapshot 401 after logout, received ${recoveryResult.snapshotsUnauthorized}`,
    );
  if (
    recoveryResult.portfolioUnauthorized !== 401 ||
    recoveryResult.publicStatus !== 200
  )
    throw new Error(
      `Portfolio authorization failed: ${JSON.stringify(recoveryResult)}`,
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
  const certificateResult = await page.evaluate(async () => {
    const progressResponse = await fetch("/api/progress");
    const progress = await progressResponse.json();
    const state = progress.state;
    state.completedLessons = ["l1", "l2", "l3", "l4", "l5", "l6"];
    state.quizResults = [
      {
        id: "q",
        quizId: "foundation-assessment",
        score: 90,
        correct: 9,
        total: 10,
        weakTopics: [],
        completedAt: new Date().toISOString(),
      },
    ];
    state.practiceAttempts = [1, 2, 3].map((index) => ({
      challengeId: `c${index}`,
      correct: true,
      answer: "verified",
      attemptedAt: new Date().toISOString(),
    }));
    state.projectTasks = { p05: ["p05-1", "p05-2", "p05-3"] };
    state.masteryArtifacts = ["foundation", "guided", "applied"].map(
      (level, index) => ({
        id: `m${index}`,
        lessonId: "foundation",
        level,
        response:
          "Verified evidence response with sufficient detail for server-side certificate testing.",
        updatedAt: new Date().toISOString(),
      }),
    );
    const saved = await fetch("/api/progress", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state, revision: progress.revision }),
    });
    const issued = await fetch("/api/certificates/issue", { method: "POST" });
    const body = await issued.json();
    const verified = await fetch(
      `/api/certificate?id=${encodeURIComponent(body.certificate?.credentialId ?? "")}`,
    );
    return {
      saved: saved.status,
      issued: issued.status,
      verified: verified.status,
      certificate: body.certificate,
    };
  });
  if (
    certificateResult.saved !== 200 ||
    ![200, 201].includes(certificateResult.issued) ||
    certificateResult.verified !== 200 ||
    certificateResult.certificate?.evidence?.projectMilestones !== 3
  )
    throw new Error(
      `Server certificate verification failed: ${JSON.stringify(certificateResult)}`,
    );
  const unpublish = await page.evaluate(async (name) => {
    const portfolio = (await (await fetch("/api/portfolio")).json()).portfolio;
    const saved = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...portfolio, published: false }),
    });
    const publicStatus = (
      await fetch(`/api/public-profile?username=${encodeURIComponent(name)}`)
    ).status;
    return { saved: saved.status, publicStatus };
  }, username);
  if (unpublish.saved !== 200 || unpublish.publicStatus !== 404)
    throw new Error(`Portfolio unpublish failed: ${JSON.stringify(unpublish)}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  console.log(
    "Account smoke passed: registration, onboarding, diagnostic roadmap, isolated code tests, workspace snapshots, Forge AI with eight response actions, note AI context, opt-in public portfolio, unpublish privacy, server-verified certificate, recovery, progress sync, and authorization.",
  );
} finally {
  await browser.close();
}
