import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

const clickText = async (text) => {
  const clicked = await page.evaluate((label) => {
    const elements = [...document.querySelectorAll("button")];
    const target = elements.find((element) =>
      element.textContent?.trim().includes(label),
    );
    if (!target) return false;
    target.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`Button not found: ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 80));
};

const expectText = async (text) => {
  const found = await page.evaluate(
    (label) => document.body.textContent?.includes(label),
    text,
  );
  if (!found) throw new Error(`Expected text not found: ${text}`);
};

try {
  await page.goto("http://localhost:5173", { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await expectText("Learn Full-Stack Development + AI");
  await clickText("Start learning");
  const fields = await page.$$(".profile-form input");
  await fields[0].type("Smoke Learner");
  await fields[1].type("smoke_learner");
  await clickText("Create profile & start");
  await expectText("Welcome back, Smoke");
  const activeProfileId = await page.evaluate(() =>
    localStorage.getItem("forge-active-profile-v1"),
  );
  if (!activeProfileId) throw new Error("Profile session was not persisted");

  await clickText("Roadmap");
  await expectText("16 phases");
  const lockedRoadmap = await page.evaluate(() =>
    [...document.querySelectorAll(".roadmap-card")].some((card) =>
      card.textContent?.includes("Locked"),
    ),
  );
  if (lockedRoadmap) throw new Error("Roadmap still contains a locked phase");
  await page.click('button[aria-label="Open TypeScript Systems"]');
  await clickText("Primitive types");
  await expectText("REQUIRED CHECKPOINT");
  await clickText("TypeScript Systems · TypeScript Foundations");
  await clickText("Complete roadmap");
  await page.click('button[aria-label="Open Orientation & Developer Setup"]');
  await expectText("Computer & Software Basics");
  await clickText("Git and GitHub");
  await expectText("Version control mental model");
  const activeGitTopic = await page.evaluate(
    () =>
      document.querySelector(".related-topic-groups button.active b")
        ?.textContent === "Git and GitHub",
  );
  if (!activeGitTopic)
    throw new Error("The selected related topic was not highlighted");
  await clickText("Next subtopic");
  const activeGitSubtopic = await page.evaluate(() =>
    document
      .querySelector(".subtopic-list button.active")
      ?.textContent?.replace(/\s+/g, " ")
      .includes("Repository and initialization"),
  );
  if (!activeGitSubtopic)
    throw new Error("The Git subtopic navigator did not advance");
  await clickText("Orientation & Developer Setup · Developer Setup");
  await clickText("How computers execute instructions");
  await expectText("Today’s goal");
  await clickText("Next subtopic");
  const activeFoundationSubtopic = await page.evaluate(() =>
    document
      .querySelector(".lesson-subtopic-menu button.active")
      ?.textContent?.replace(/\s+/g, " ")
      .includes("Programs turn algorithms into action"),
  );
  if (!activeFoundationSubtopic)
    throw new Error("The foundation lesson did not advance a subtopic");
  await clickText("Trace a tiny program");
  await clickText("Next lesson");
  await expectText("How the web works");

  await clickText("Practice");
  await expectText("Train the skill");
  await clickText("A → D → C → B");
  await clickText("Check answer");
  await expectText("Exactly right");
  const attemptsBeforeReload = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .practiceAttempts.length,
    activeProfileId,
  );
  if (attemptsBeforeReload !== 1)
    throw new Error("Practice attempt was not persisted");
  await page.reload({ waitUntil: "networkidle0" });
  await clickText("Practice");
  await expectText("1 saved attempts");

  await clickText("Quizzes");
  await clickText("Start assessment");
  const quizAnswers = [
    "RAM",
    "URL → DNS → connection → HTTP request → response → render",
    "body",
    "A native button",
    "Client validation can be bypassed",
    "Content, padding, and border",
    "The content no longer fits or reads well",
    "Ends the call and provides a value to its caller",
    "filter",
    "Queued microtasks",
  ];
  for (let index = 0; index < quizAnswers.length; index += 1) {
    await clickText(quizAnswers[index]);
    await clickText(
      index === quizAnswers.length - 1 ? "Submit assessment" : "Next",
    );
  }
  await expectText("PASSED");
  const quizResults = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .quizResults,
    activeProfileId,
  );
  if (quizResults.length !== 1 || quizResults[0].score !== 100)
    throw new Error("Foundation assessment result was not persisted");

  await clickText("Certificates");
  await expectText("Requirements incomplete");
  await page.evaluate((id) => {
    const key = `forge-learning-state-v1:${id}`;
    const state = JSON.parse(localStorage.getItem(key));
    state.completedLessons = [
      "day-1-computers",
      "day-2-web",
      "day-3-html",
      "day-4-semantic-html",
      "day-5-css",
      "day-6-javascript",
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, activeProfileId);
  await page.reload({ waitUntil: "networkidle0" });
  await clickText("Issue certificate");
  await expectText("Credential ID");
  const certificates = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .certificates,
    activeProfileId,
  );
  if (certificates.length !== 1)
    throw new Error("Eligible foundation certificate was not persisted");

  await clickText("Knowledge");
  await clickText("New note");
  const inputs = await page.$$(".modal input");
  await inputs[0].type("Smoke test note");
  await page.type(
    ".modal textarea",
    "This verifies that local knowledge entries persist after a browser refresh.",
  );
  await clickText("Save");
  await expectText("Smoke test note");

  await clickText("Projects");
  await clickText("Continue P05");
  await expectText("PROJECT WORKSPACE");
  await clickText("Define search contract");
  await expectText("1/11 saved locally");
  await clickText("All projects");

  await clickText("Reviews");
  await expectText("Make knowledge");
  await page.click(".check-button");
  const completedReviews = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .completedReviews.length,
    activeProfileId,
  );
  if (completedReviews !== 1)
    throw new Error("Review completion was not persisted");

  await clickText("Interview");
  await clickText("Start");
  await page.type(
    ".interview-question textarea",
    "The call stack executes synchronous work. Promise callbacks enter the microtask queue while timer callbacks enter the task queue. For example, I used this model in a project to prevent stale search results. A trade-off is that long tasks block rendering and endless microtasks can cause starvation.",
  );
  await clickText("Submit");
  await expectText("100%");

  await page.keyboard.down("Meta");
  await page.keyboard.press("KeyK");
  await page.keyboard.up("Meta");
  await expectText("QUICK NAVIGATION");
  await page.keyboard.press("Escape");

  await page.click('button[aria-label="Open learner settings"]');
  await clickText("Log out");
  await expectText("Learn Full-Stack Development + AI");
  await clickText("Login");
  await clickText("Smoke Learner");
  await expectText("Interview training room");
  const restoredAttempts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .practiceAttempts.length,
    activeProfileId,
  );
  if (restoredAttempts !== 1)
    throw new Error("Profile progress was not restored after logout/login");

  await page.click('button[aria-label="Open learner settings"]');
  await clickText("Reset all & start over");
  await clickText("Confirm reset");
  await expectText("How computers execute instructions");
  const resetState = await page.evaluate(
    (id) => JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`)),
    activeProfileId,
  );
  if (
    resetState.xp !== 0 ||
    resetState.completedLessons.length ||
    resetState.practiceAttempts.length ||
    resetState.quizResults.length ||
    resetState.certificates.length
  )
    throw new Error(
      "Reset all did not return the active learner to a clean Day 1 state",
    );

  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: "networkidle0" });
  await expectText("How computers execute instructions");
  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  if (horizontalOverflow) {
    const offenders = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.right > document.documentElement.clientWidth + 1 ||
            rect.left < -1
          );
        })
        .slice(0, 8)
        .map(
          (element) =>
            `${element.tagName}.${element.className}: ${Math.round(element.getBoundingClientRect().left)}..${Math.round(element.getBoundingClientRect().right)}`,
        ),
    );
    throw new Error(
      `Mobile layout has horizontal overflow: ${offenders.join(" | ")}`,
    );
  }

  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  console.log(
    "Smoke test passed: topic/subtopic navigation, dashboard, persistence, assessments, certificates, projects, interview, search, and mobile layout.",
  );
} finally {
  await browser.close();
}
