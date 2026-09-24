import puppeteer from "puppeteer-core";

const baseUrl =
  process.env.FORGE_DEPLOY_URL ??
  "https://forge-ai-engineering.taufiqueansari895.workers.dev";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
page.setDefaultTimeout(12_000);
page.setDefaultNavigationTimeout(30_000);
const browserErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(message.text());
});
page.on("pageerror", (error) => browserErrors.push(error.message));

const open = async (path, expectedText) => {
  const response = await page.goto(`${baseUrl}${path}`, {
    waitUntil: "networkidle0",
  });
  if (response?.status() !== 200)
    throw new Error(`${path} returned ${response?.status() ?? "no response"}`);
  await page.waitForFunction(
    (text) => document.body.textContent?.includes(text),
    { timeout: 8000 },
    expectedText,
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  if (overflow) throw new Error(`${path} has horizontal page overflow`);
};

try {
  await page.setViewport({ width: 1440, height: 900 });
  await open("/", "Learn web development and AI, one clear step at a time.");
  const pwa = await page.evaluate(async () => {
    const [manifestResponse, workerResponse] = await Promise.all([
      fetch("/manifest.webmanifest"),
      fetch("/sw.js"),
    ]);
    const manifest = await manifestResponse.json();
    const worker = await workerResponse.text();
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        window.setTimeout(
          () => reject(new Error("Service worker registration timed out")),
          12_000,
        ),
      ),
    ]);
    return {
      manifestStatus: manifestResponse.status,
      workerStatus: workerResponse.status,
      display: manifest.display,
      startUrl: manifest.start_url,
      workerScope: registration.scope,
      hasOfflineShell: worker.includes("navigationResponse"),
    };
  });
  if (
    pwa.manifestStatus !== 200 ||
    pwa.workerStatus !== 200 ||
    pwa.display !== "standalone" ||
    pwa.startUrl !== "/" ||
    !pwa.workerScope.startsWith(baseUrl) ||
    !pwa.hasOfflineShell
  )
    throw new Error(`Production PWA setup failed: ${JSON.stringify(pwa)}`);
  console.log("PWA manifest and service worker registration passed.");
  const operations = await page.evaluate(async () => {
    const [healthResponse, contractResponse, rootResponse, runnerResponse] =
      await Promise.all([
        fetch("/api/health"),
        fetch("/api/v1/openapi.json"),
        fetch(`/?security-audit=${Date.now()}`, { cache: "no-store" }),
        fetch(`/runner-worker.js?security-audit=${Date.now()}`, {
          cache: "no-store",
        }),
      ]);
    return {
      healthStatus: healthResponse.status,
      health: await healthResponse.json(),
      apiVersion: healthResponse.headers.get("x-forge-api-version"),
      apiContractLink: healthResponse.headers.get("link"),
      contractStatus: contractResponse.status,
      contract: await contractResponse.json(),
      requestId: healthResponse.headers.get("x-request-id"),
      serverTiming: healthResponse.headers.get("server-timing"),
      contentSecurityPolicy: rootResponse.headers.get(
        "content-security-policy",
      ),
      strictTransportSecurity: rootResponse.headers.get(
        "strict-transport-security",
      ),
      runnerContentSecurityPolicy: runnerResponse.headers.get(
        "content-security-policy",
      ),
    };
  });
  if (
    operations.healthStatus !== 200 ||
    operations.health.status !== "ok" ||
    operations.health.database !== "connected" ||
    typeof operations.health.databaseLatencyMs !== "number" ||
    operations.apiVersion !== "1" ||
    !operations.apiContractLink?.includes("/api/v1/openapi.json") ||
    operations.contractStatus !== 200 ||
    operations.contract.openapi !== "3.1.0" ||
    operations.contract.info?.version !== "1.0.0" ||
    !operations.requestId ||
    !operations.serverTiming?.startsWith("forge;dur=") ||
    !operations.contentSecurityPolicy?.includes("frame-ancestors 'none'") ||
    operations.contentSecurityPolicy?.includes("unsafe-eval") ||
    !operations.runnerContentSecurityPolicy?.includes("unsafe-eval") ||
    !operations.runnerContentSecurityPolicy?.includes("connect-src 'none'") ||
    !operations.strictTransportSecurity?.includes("max-age=31536000")
  )
    throw new Error(
      `Production operations hardening failed: ${JSON.stringify(operations)}`,
    );
  await page.evaluate(() => {
    const profile = {
      id: "production_audit",
      fullName: "Production Audit",
      username: "production_audit",
      level: "Complete Beginner",
      goal: "Become Full-Stack AI Developer",
      dailyGoal: "1 Hour",
      speed: "Normal",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("forge-local-profiles-v1", JSON.stringify([profile]));
    localStorage.setItem("forge-active-profile-v1", profile.id);
  });

  await open("/", "EVIDENCE REWARDS");
  const gamification = await page.evaluate(() => ({
    badges: document.querySelectorAll(".evidence-badge").length,
    unlocked: document.querySelectorAll(".evidence-badge.unlocked").length,
    level: document.querySelector(".gamification-summary h2")?.textContent,
    milestone: document.querySelector(".next-milestone")?.textContent,
  }));
  if (
    gamification.badges !== 6 ||
    gamification.unlocked !== 0 ||
    !gamification.level?.includes("Level 1") ||
    !gamification.milestone?.includes("Solve a practice challenge")
  )
    throw new Error(
      `Production evidence gamification failed: ${JSON.stringify(gamification)}`,
    );

  await open("/roadmap", "Start at zero. Grow into an");
  await page.click('button[aria-label="Open Orientation & Developer Setup"]');
  await page.evaluate(() => {
    const target = [...document.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("npm and package management"),
    );
    if (!(target instanceof HTMLButtonElement))
      throw new Error("npm topic button was not available");
    target.click();
  });
  await page.waitForFunction(
    () => document.body.textContent?.includes("What npm manages"),
    { timeout: 8000 },
  );
  await page.waitForFunction(
    () =>
      document.body.textContent?.includes("npm ci: clean, repeatable installs"),
    { timeout: 8000 },
  );
  const npmLesson = await page.evaluate(() => {
    const activeTopic = document.querySelector(
      '.related-topics [aria-current="page"]',
    );
    const rail = document.querySelector(".related-topics");
    const topicBox = activeTopic?.getBoundingClientRect();
    const visible = Boolean(
      topicBox && topicBox.top >= 0 && topicBox.bottom <= window.innerHeight,
    );
    return {
      focused: Boolean(document.querySelector(".app-shell.learning-focus")),
      activeTopic: activeTopic?.textContent,
      visible,
      chapterCount: document.querySelectorAll(".full-learning-chapter").length,
      caseCount: document.querySelectorAll(".example-case-tabs [role='tab']")
        .length,
      hasRail: Boolean(rail),
    };
  });
  if (
    !npmLesson.focused ||
    !npmLesson.hasRail ||
    !npmLesson.visible ||
    !npmLesson.activeTopic?.includes("npm and package management") ||
    npmLesson.chapterCount !== 11 ||
    npmLesson.caseCount !== 3
  )
    throw new Error(
      `Production npm lesson failed: ${JSON.stringify(npmLesson)}`,
    );
  await page.$eval(".topic-rail-toggle", (button) => button.click());
  await page.waitForFunction(() => !document.querySelector(".related-topics"));
  await page.$eval(".topic-rail-toggle", (button) => button.click());
  await open("/learn", "How computers execute instructions");
  const focused = await page.$(".learning-focus");
  const globalChrome = await page.$(
    ".learning-focus .sidebar, .learning-focus .topbar",
  );
  if (!focused || globalChrome)
    throw new Error("Production learning route did not enter focused mode");

  await open("/resources", "LEARNING RESOURCES");
  await open("/projects", "Project workshop");
  const projectUi = await page.evaluate(() => ({
    startAction: document.querySelector(".page-title .primary-button")
      ?.textContent,
    uniqueSymbols: new Set(
      [...document.querySelectorAll(".project-symbol svg")].map((icon) =>
        [...icon.classList].find((name) => name.startsWith("lucide-")),
      ),
    ).size,
    namedActions: [...document.querySelectorAll(".project-open-button")].every(
      (button) =>
        button.textContent?.includes("Open project") &&
        button.getBoundingClientRect().height >= 40 &&
        button.getAttribute("aria-label")?.startsWith("Open "),
    ),
    unnamedButtons: [...document.querySelectorAll("button")].filter(
      (button) => {
        const visible = Boolean(
          button.offsetWidth ||
          button.offsetHeight ||
          button.getClientRects().length,
        );
        const name =
          button.getAttribute("aria-label")?.trim() ||
          button.getAttribute("title")?.trim() ||
          button.textContent?.trim();
        return visible && !name;
      },
    ).length,
  }));
  if (
    !projectUi.startAction?.includes("Start P05") ||
    projectUi.uniqueSymbols !== 4 ||
    !projectUi.namedActions ||
    projectUi.unnamedButtons !== 0
  )
    throw new Error(
      `Production project controls failed: ${JSON.stringify(projectUi)}`,
    );
  await page.setViewport({ width: 390, height: 844 });
  await open("/projects", "Open project");
  await open("/learn", "COURSE TOPICS");
  await page.setOfflineMode(true);
  await page.goto(`${baseUrl}/resources`, {
    waitUntil: "domcontentloaded",
    timeout: 12_000,
  });
  await page.waitForFunction(
    () => document.body.textContent?.includes("LEARNING RESOURCES"),
    { timeout: 8000 },
  );
  await page.setOfflineMode(false);
  console.log("Cached offline navigation passed.");

  const unexpectedBrowserErrors = browserErrors.filter(
    (message) => !message.includes("ERR_INTERNET_DISCONNECTED"),
  );
  if (unexpectedBrowserErrors.length)
    throw new Error(`Browser errors: ${unexpectedBrowserErrors.join(" | ")}`);
  console.log(
    `Cloudflare verification passed for ${baseUrl}: versioned OpenAPI discovery, correlated health/database timing and security headers, evidence-derived gamification, installable PWA metadata, registered offline shell, cached offline navigation, SPA routes, deep npm lesson, interactive examples, project icons and named controls, focused learning, course-rail controls, console health, and 390px overflow.`,
  );
} finally {
  await browser.close();
}
