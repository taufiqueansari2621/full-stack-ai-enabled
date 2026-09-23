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
  try {
    await page.waitForFunction(
      (label) => document.body.textContent?.includes(label),
      { timeout: 4000 },
      text,
    );
  } catch {
    throw new Error(`Expected text not found: ${text}`);
  }
};

const expectNoHorizontalOverflow = async (context) => {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  if (!overflow) return;
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
    `${context} has horizontal overflow: ${offenders.join(" | ")}`,
  );
};

const expectPlainEnglish = async (context) => {
  const oldPhrases = [
    "FULL LEARNING MODE",
    "Mastery Studio",
    "Save artifact",
    "CURRICULUM-WIDE PRACTICE",
    "EVIDENCE-BASED PROGRESS",
    "PERSONAL KNOWLEDGE BASE",
    "SOCRATIC COACH",
    "RESOURCE ACADEMY",
    "structured rubric",
    "Local rubric",
    "persistent engineering milestones",
    "Resource integrity",
    "Your queue persists",
  ];
  const found = await page.evaluate(
    (phrases) =>
      phrases.filter((phrase) => document.body.textContent?.includes(phrase)),
    oldPhrases,
  );
  if (found.length)
    throw new Error(
      `${context} still shows unclear product copy: ${found.join(", ")}`,
    );
};

const expectNamedButtons = async (context) => {
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((button) => {
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
      })
      .map((button) => button.className || "button without a class")
      .slice(0, 8),
  );
  if (unnamed.length)
    throw new Error(
      `${context} has icon-only buttons without accessible names: ${unnamed.join(", ")}`,
    );
};

const expectFocusedLearningShell = async (context) => {
  const state = await page.evaluate(() => ({
    focused: document
      .querySelector(".app-shell")
      ?.classList.contains("learning-focus"),
    globalChrome: Boolean(
      document.querySelector(
        ".learning-focus .sidebar, .learning-focus .topbar, .learning-focus .floating-mentor",
      ),
    ),
    topicRail: Boolean(
      document.querySelector(
        ".learning-focus .related-topics, .learning-focus .day-list",
      ),
    ),
    backControl: Boolean(document.querySelector(".learning-focus .back-link")),
    focusControls: document.querySelectorAll(
      ".learning-focus .focus-screen-actions button",
    ).length,
    mainMargin: getComputedStyle(document.querySelector(".main-shell"))
      .marginLeft,
    mobileRail:
      window.innerWidth <= 900
        ? (() => {
            const rail = document.querySelector(
              ".learning-focus .course-topic-list, .learning-focus .related-topic-groups",
            );
            return rail
              ? {
                  direction: getComputedStyle(rail).flexDirection,
                  scrollable: rail.scrollWidth > rail.clientWidth,
                }
              : null;
          })()
        : null,
  }));
  if (!state.focused)
    throw new Error(`${context} did not enter focused learning mode`);
  if (state.globalChrome)
    throw new Error(`${context} still rendered global navigation chrome`);
  if (!state.topicRail)
    throw new Error(`${context} did not render the course-topic rail`);
  if (!state.backControl)
    throw new Error(`${context} did not provide a back control`);
  if (state.focusControls !== 2)
    throw new Error(`${context} did not provide menu and full-screen controls`);
  if (state.mainMargin !== "0px")
    throw new Error(
      `${context} kept a ${state.mainMargin} desktop shell offset`,
    );
  if (
    state.mobileRail &&
    (state.mobileRail.direction !== "row" || !state.mobileRail.scrollable)
  )
    throw new Error(
      `${context} did not provide a horizontal swipeable topic rail`,
    );
};

try {
  // Use an origin separate from normal localhost development so destructive
  // reset checks can never clear a learner's real local development profile.
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await expectText("Learn web development and AI, one clear step at a time.");
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
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expectText("lessons and visited pages remain available");
  await page.evaluate(() => window.dispatchEvent(new Event("online")));

  await clickText("Learning Path");
  await expectText("17 stages");
  const lockedRoadmap = await page.evaluate(() =>
    [...document.querySelectorAll(".roadmap-card")].some((card) =>
      card.textContent?.includes("Locked"),
    ),
  );
  if (lockedRoadmap) throw new Error("Roadmap still contains a locked phase");
  await clickText("Interactive flow");
  await expectText("Click any stage to explore its learning tree");
  const flowStages = await page.$$(".flow-stage");
  if (flowStages.length !== 17)
    throw new Error(
      `Expected 17 interactive flow stages, found ${flowStages.length}`,
    );
  await clickText("Card view");
  await page.click('button[aria-label="Open Frontend Engineering"]');
  await expectText("CHOOSE A FRONTEND FRAMEWORK");
  await page.click(".framework-choice-options button:nth-child(2)");
  await expectText("Angular · Foundations");
  const reactTrackVisible = await page.evaluate(() =>
    [...document.querySelectorAll(".module-heading h2")].some(
      (heading) => heading.textContent?.trim() === "React · Foundations",
    ),
  );
  if (reactTrackVisible)
    throw new Error("React modules remained visible in the Angular-only path");
  await clickText("How Angular works");
  await expectText("COMPLETE LESSON");
  await expectText("COURSE TOPICS");
  await expectFocusedLearningShell("Angular topic");
  await expectText("tree of components");
  await page.waitForSelector(".lesson-resources");
  await expectText("Angular Tutorials");
  const renderedAngularChapters = await page.$$(".full-learning-chapter");
  if (renderedAngularChapters.length !== 9)
    throw new Error(
      "Angular Full Learning Mode is missing professional chapters",
    );
  await clickText("Frontend Engineering · Angular · Foundations");
  await clickText("Back to the full learning path");
  const selectedFrameworkPath = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .frontendFrameworkPath,
    activeProfileId,
  );
  if (selectedFrameworkPath !== "angular")
    throw new Error("Angular framework choice was not persisted");
  await page.click('button[aria-label="Open TypeScript Systems"]');
  await clickText("Primitive types");
  await expectText("QUICK CHECK");
  await clickText("TypeScript Systems · TypeScript Foundations");
  await clickText("Back to the full learning path");
  await page.click('button[aria-label="Open Orientation & Developer Setup"]');
  await expectText("Computer & Software Basics");
  await clickText("Git and GitHub");
  await expectText("COURSE TOPICS");
  await expectFocusedLearningShell("Git topic");
  await expectText("How version control works");
  const activeGitTopic = await page.evaluate(
    () =>
      document.querySelector(".related-topic-groups button.active b")
        ?.textContent === "Git and GitHub",
  );
  if (!activeGitTopic)
    throw new Error("The selected related topic was not highlighted");
  await expectText("COMPLETE LESSON");
  await expectText("Repository and initialization");
  const subtopicSelectorStillVisible = await page.$(".subtopic-picker");
  if (subtopicSelectorStillVisible)
    throw new Error("The removed subtopic selector is still visible");
  const renderedGitChapters = await page.$$(".full-learning-chapter");
  if (renderedGitChapters.length !== 11)
    throw new Error("Full Learning Mode did not render every Git chapter");
  await expectText("Build your skill");
  await page.type(
    ".mastery-level-main textarea",
    "Git records project snapshots so developers can review and recover changes. The working tree holds edits, the index selects the next snapshot, and a commit records it. I would verify the result with status, diff, and log.",
  );
  await clickText("Save my work");
  await clickText("Next level");
  await expectText("Follow Git and GitHub step by step");
  const masteryArtifacts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .masteryArtifacts,
    activeProfileId,
  );
  if (
    masteryArtifacts.length !== 1 ||
    masteryArtifacts[0].level !== "foundation"
  )
    throw new Error("Mastery artifact was not persisted");
  await clickText("npm and package management");
  await expectText("What npm manages");
  await expectText("The lockfile and repeatable installs");
  await expectText("Supply-chain safety");
  await expectText("INTERACTIVE EXAMPLE LAB");
  await expectText("npm install date-fns");
  const npmLessonQuality = await page.evaluate(() => {
    const examples = [
      ...document.querySelectorAll(".full-learning-example code"),
    ]
      .map((element) => element.textContent?.trim())
      .filter(Boolean);
    return {
      sectionCount: document.querySelectorAll(".full-learning-chapter").length,
      uniqueExamples: new Set(examples).size,
      exampleCount: examples.length,
    };
  });
  if (
    npmLessonQuality.sectionCount !== 11 ||
    npmLessonQuality.uniqueExamples !== npmLessonQuality.exampleCount
  )
    throw new Error(
      `npm lesson is incomplete or repeats examples: ${JSON.stringify(npmLessonQuality)}`,
    );
  await page.type(
    ".example-lab-response textarea",
    "I expect the runtime package and test package to be saved in different dependency groups, while the lockfile records exact versions.",
  );
  await clickText("Reveal result");
  await expectText("Expected result");
  await page.type(
    ".example-lab-reflection textarea",
    "My prediction matched the result. I would check both dependency sections and review the lockfile before committing the change.",
  );
  await clickText("Save this case");
  const exampleLabRecords = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .exampleLabRecords,
    activeProfileId,
  );
  if (
    exampleLabRecords.length !== 1 ||
    exampleLabRecords[0].caseId !== "normal"
  )
    throw new Error("Interactive example work was not persisted");
  await clickText("Hide course topics");
  const hiddenTopicRail = await page.$(".related-topics");
  if (hiddenTopicRail)
    throw new Error(
      "Course topics remained visible after the learner hid them",
    );
  await clickText("Show course topics");
  await expectFocusedLearningShell("npm lesson after restoring course topics");
  await clickText("Orientation & Developer Setup · Developer Setup");
  await clickText("How computers execute instructions");
  await expectText("Your goal and what you need first");
  await expectText("COURSE TOPICS");
  await expectText("Foundation course");
  await expectFocusedLearningShell("Foundation lesson");
  await expectText("Important words and ideas");
  await expectText("Programs turn algorithms into action");
  await expectText("WHY IT MATTERS");
  await expectText("HOW IT WORKS · STEP BY STEP");
  await expectText("REAL-WORLD EXAMPLE");
  await expectText("PRACTICE NOW");
  await expectText("INTERVIEW + REVIEW");
  const foundationSelectorStillVisible = await page.$(".lesson-subtopic-menu");
  if (foundationSelectorStillVisible)
    throw new Error("The removed foundation task selector is still visible");
  const focusedPages = await page.$$(".focused-lesson-page");
  const foundationOutline = await page.$(".full-lesson-outline");
  const courseTopics = await page.$$(".course-topic-list button");
  if (foundationOutline)
    throw new Error("Foundation sidebar still shows lesson subtasks");
  if (courseTopics.length !== 6)
    throw new Error("Foundation sidebar does not show all six course topics");
  if (focusedPages.length < 8)
    throw new Error("Full Learning Mode did not render the complete lesson");
  await clickText("Back to Orientation & Developer Setup");
  await expectText("Computer & Software Basics");
  await expectText("Internet & Web Basics");
  await clickText("How computers execute instructions");
  await clickText("Next lesson");
  await expectText("How the web works");
  await clickText("Back to Orientation & Developer Setup");

  await clickText("Practice");
  await expectText("Practice the skill");
  await clickText("A → D → C → B");
  await clickText("Check answer");
  await expectText("Correct");
  await page.click(".challenge-list button:nth-child(2)");
  await page.waitForFunction(
    () =>
      document.querySelector(".challenge-workspace h2")?.textContent ===
      "Closure reasoning",
  );
  await page.click(".challenge-options button");
  await clickText("Check answer");
  await expectText("Try again");
  const attemptsBeforeReload = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .practiceAttempts.length,
    activeProfileId,
  );
  if (attemptsBeforeReload !== 2)
    throw new Error("Practice attempt was not persisted");
  await page.reload({ waitUntil: "networkidle0" });
  await clickText("Practice");
  await expectText("1 saved answers");
  await clickText("Practice by topic");
  await page.waitForSelector(".topic-practice-lab");
  await expectText("PRACTICE ANY TOPIC");
  await page.click(".difficulty-picker button:nth-child(2)");
  await new Promise((resolve) => setTimeout(resolve, 80));
  await page.type(
    ".practice-artifact-editor textarea",
    "I defined acceptance criteria, implemented the normal and boundary cases, reproduced one failure, added a regression test, and documented why this approach fits the constraints better than the alternative.",
  );
  await clickText("Save my work");
  const topicPracticeArtifacts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .topicPracticeArtifacts,
    activeProfileId,
  );
  if (
    topicPracticeArtifacts.length !== 1 ||
    topicPracticeArtifacts[0].difficulty !== "medium"
  )
    throw new Error(
      `Topic practice artifact was not persisted: ${JSON.stringify(topicPracticeArtifacts)}`,
    );

  await clickText("Resources");
  await page.waitForSelector(".resources-page");
  await expectText("LEARNING RESOURCES");
  await expectText("freeCodeCamp Curriculum");
  await expectText("Frontend Developer");
  await expectText("DSA & Coding Interviews");
  await expectText("Official guides and practice");

  await clickText("Quizzes");
  await clickText("Start test");
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
    await clickText(index === quizAnswers.length - 1 ? "Finish test" : "Next");
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
  await expectText("Finish the requirements");
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
  await clickText("Get certificate");
  await expectText("Credential ID");
  const certificates = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .certificates,
    activeProfileId,
  );
  if (certificates.length !== 1)
    throw new Error("Eligible foundation certificate was not persisted");

  await clickText("My Notes");
  await clickText("New note");
  const inputs = await page.$$(".modal input");
  await inputs[0].type("Smoke test note");
  await page.type(
    ".modal textarea",
    "## Token check\nThis verifies **Markdown** and inline `token` values.\n```js\nconst token = verify();\n```",
  );
  await inputs[1].type("authentication, debugging");
  await inputs[2].type("Authentication lesson");
  await inputs[3].type("P20 Secure API Platform");
  await clickText("Save");
  await expectText("Smoke test note");
  await expectText("const token = verify();");
  await page.click('button[aria-label="Add Smoke test note to favorites"]');
  await clickText("Flashcard");
  await clickText("Add to Review");
  await clickText("Favorites");
  await expectText("Smoke test note");
  const noteUpgrade = await page.evaluate((id) => {
    const state = JSON.parse(
      localStorage.getItem(`forge-learning-state-v1:${id}`),
    );
    return {
      note: state.knowledge[0],
      reviews: state.reviewSchedule.filter((item) =>
        item.sourceId.startsWith("knowledge:"),
      ),
    };
  }, activeProfileId);
  if (
    !noteUpgrade.note.favorite ||
    noteUpgrade.note.tags.length !== 2 ||
    noteUpgrade.reviews.length !== 2
  )
    throw new Error(
      `Notes 2.0 persistence failed: ${JSON.stringify(noteUpgrade)}`,
    );

  await clickText("Projects");
  await expectText("Start P05");
  const projectCardCount = await page.$$(".project-card");
  if (projectCardCount.length < 8)
    throw new Error(
      `Expected at least 8 guided projects, found ${projectCardCount.length}`,
    );
  const projectControls = await page.evaluate(() => ({
    uniqueSymbols: new Set(
      [...document.querySelectorAll(".project-symbol svg")].map((icon) =>
        [...icon.classList].find((name) => name.startsWith("lucide-")),
      ),
    ).size,
    labeledActions: [
      ...document.querySelectorAll(".project-open-button"),
    ].every(
      (button) =>
        button.textContent?.includes("Open project") &&
        button.getBoundingClientRect().height >= 40 &&
        button.getAttribute("aria-label")?.startsWith("Open "),
    ),
  }));
  if (projectControls.uniqueSymbols !== 4 || !projectControls.labeledActions)
    throw new Error(
      `Project icon controls failed: ${JSON.stringify(projectControls)}`,
    );
  await expectNamedButtons("Projects");
  await clickText("Start P05");
  await expectText("PROJECT WORKSPACE");
  await expectNamedButtons("Project workspace");
  await clickText("Define search contract");
  await expectText("1/11 saved locally");
  await clickText("All projects");

  await clickText("Advanced Labs");
  await expectText("Advanced engineering");
  await clickText("Next");
  await expectText("Compare 7 and 2");
  await clickText("System Design");
  await clickText("+ Cache");
  await expectText("Clear canvas");
  await clickText("SQL");
  await clickText("Run query");
  await expectText("Ada");
  await clickText("RAG");
  await expectText("Pipeline telemetry");
  await page.type(
    ".lab-evidence textarea",
    "The retrieved context stayed grounded, and an empty retrieval must produce an insufficient-context response.",
  );
  await clickText("Save evidence");
  const labArtifacts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .labArtifacts,
    activeProfileId,
  );
  if (labArtifacts.length !== 1 || labArtifacts[0].lab !== "rag")
    throw new Error(
      `Advanced lab evidence was not persisted: ${JSON.stringify(labArtifacts)}`,
    );

  await clickText("AI Help");
  await expectText("Train your tutor");
  await clickText("Train your tutor");
  await page.type(".mentor-training-form input", "Smoke authentication guide");
  await page.type(
    ".mentor-training-form textarea",
    "Authentication uses short-lived access tokens and rotating refresh tokens. Every protected request verifies the signature, issuer, audience, expiry, and user permissions before data access.",
  );
  await clickText("Add to knowledge base");
  await expectText("1 custom sources");
  await page.type(
    ".mentor-input textarea",
    "How does authentication verify access tokens?",
  );
  await page.click(".mentor-input button");
  await expectText("Based on your training material");
  await expectText("Your source: Smoke authentication guide");

  await clickText("Review");
  await expectText("Make knowledge");
  await expectText("new weak signal");
  await clickText("Good");
  const scheduledReview = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .reviewSchedule[0],
    activeProfileId,
  );
  if (
    scheduledReview.streak !== 1 ||
    scheduledReview.lastRating !== "good" ||
    new Date(scheduledReview.nextReviewAt).getTime() <= Date.now()
  )
    throw new Error(
      `Spaced review was not rescheduled: ${JSON.stringify(scheduledReview)}`,
    );

  await clickText("Interview Prep");
  await expectText("10,260 questions");
  await expectText("684 topics. Three levels. Five question formats.");
  const interviewBank = await page.evaluate(() => ({
    cards: document.querySelectorAll(".interview-bank-card").length,
    total: document.querySelector(".interview-bank-total b")?.textContent,
    frontend: [...document.querySelectorAll(".interview-role-grid small")][0]
      ?.textContent,
  }));
  if (
    interviewBank.cards !== 12 ||
    interviewBank.total !== "10,260" ||
    !interviewBank.frontend?.includes("questions")
  )
    throw new Error(`Interview bank failed: ${JSON.stringify(interviewBank)}`);
  const interviewSelects = await page.$$(".interview-filters select");
  await interviewSelects[1].select("javascript");
  await interviewSelects[2].select("Advanced");
  await interviewSelects[3].select("Debugging");
  await expectText("matching questions");
  const filteredInterviewCount = await page.$eval(
    ".interview-bank-heading h2",
    (element) => Number(element.textContent?.replace(/\D/g, "")),
  );
  if (!filteredInterviewCount || filteredInterviewCount >= 10260)
    throw new Error("Interview filters did not reduce the real question count");
  await clickText("Clear filters");
  await clickText("Quick practice");
  await expectText("1 of 5");
  const interviewTopic = await page.$eval(
    ".interview-question-pro > .eyebrow",
    (element) => element.textContent?.trim() ?? "this topic",
  );
  await page.type(
    ".interview-answer-box textarea",
    `${interviewTopic} solves a specific engineering problem because it creates a clear flow from input to result. First I define the requirement and constraint, then I describe the component boundary, data, request, service, and database behavior. In a project example, I used this approach to build a small feature and checked the actual result against the expected result. I would test normal input, an unusual case, and failure behavior, then monitor logs, traces, latency, performance, security, memory, and cost metrics. My first hypothesis would be verified with a minimal reproduction and a regression test. An alternative design may be simpler, but the trade-off is reliability versus complexity. My role and responsibility would be to explain the risk, decide with the team, measure the result, and document what we learned and improved.`,
  );
  await clickText("Score my answer");
  await expectText("structure score");
  await expectText("Strong-answer outline");
  const savedInterview = await page.evaluate((id) => {
    const results = JSON.parse(
      localStorage.getItem(`forge-learning-state-v1:${id}`),
    ).interviewResults;
    return results.at(-1);
  }, activeProfileId);
  if (
    !savedInterview?.questionId ||
    !savedInterview?.topic ||
    !savedInterview?.difficulty ||
    !savedInterview?.format ||
    !Array.isArray(savedInterview?.strengths)
  )
    throw new Error("Professional interview attempt metadata was not saved");
  await clickText("End session");
  await clickText("My history");
  await expectText("Attempt history");
  await expectText(interviewTopic);

  await clickText("My Progress");
  await expectText("State backed by evidence");
  const analyticsAudit = await page.evaluate(() => ({
    cards: document.querySelectorAll(".analytics-card").length,
    skills: document.querySelectorAll(".skill-matrix > button").length,
    days: document.querySelectorAll(".activity-bars > div").length,
  }));
  if (
    analyticsAudit.cards !== 8 ||
    analyticsAudit.skills !== 10 ||
    analyticsAudit.days !== 7
  )
    throw new Error(
      `Progress analytics are incomplete: ${JSON.stringify(analyticsAudit)}`,
    );
  await clickText("RAG & AI Systems");
  await expectText("saved lab case study");
  await expectText("Build RAG & AI Systems evidence");

  await page.click('button[aria-label^="Open notifications"]');
  await expectText("Notifications");
  await expectText("Continue your active project");
  await expectText("SQL has no recent evidence");
  await page.click('button[aria-label="Close notifications"]');

  await page.keyboard.down("Control");
  await page.keyboard.press("KeyK");
  await page.keyboard.up("Control");
  await expectText("COMMANDS");
  await page.type(".global-search input", "event loop");
  await expectText("Event loop");
  await expectText("Interview");
  await page.keyboard.press("Escape");

  await page.click('button[aria-label="Open learner settings"]');
  await clickText("Log out");
  await expectText("Learn web development and AI, one clear step at a time.");
  await clickText("Login");
  await clickText("Smoke Learner");
  await expectText("State backed by evidence");
  const restoredAttempts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .practiceAttempts.length,
    activeProfileId,
  );
  if (restoredAttempts !== 2)
    throw new Error("Profile progress was not restored after logout/login");
  const restoredMasteryArtifacts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .masteryArtifacts.length,
    activeProfileId,
  );
  if (restoredMasteryArtifacts !== 1)
    throw new Error("Mastery artifact was not restored after logout/login");
  const restoredTopicPracticeArtifacts = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .topicPracticeArtifacts.length,
    activeProfileId,
  );
  if (restoredTopicPracticeArtifacts !== 1)
    throw new Error(
      "Topic practice artifact was not restored after logout/login",
    );
  const restoredExampleLabRecords = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .exampleLabRecords.length,
    activeProfileId,
  );
  if (restoredExampleLabRecords !== 1)
    throw new Error(
      "Interactive example work was not restored after logout/login",
    );
  const restoredInterviewResults = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .interviewResults,
    activeProfileId,
  );
  if (
    restoredInterviewResults.length !== 1 ||
    !restoredInterviewResults[0].questionId
  )
    throw new Error(
      "Interview Academy history was not restored after logout/login",
    );
  const restoredFrameworkPath = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`forge-learning-state-v1:${id}`))
        .frontendFrameworkPath,
    activeProfileId,
  );
  if (restoredFrameworkPath !== "angular")
    throw new Error("Framework choice was not restored after logout/login");

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
    resetState.masteryArtifacts.length ||
    resetState.topicPracticeArtifacts.length ||
    resetState.exampleLabRecords.length ||
    resetState.reviewSchedule.length ||
    resetState.labArtifacts.length ||
    resetState.interviewResults.length ||
    resetState.quizResults.length ||
    resetState.certificates.length ||
    resetState.frontendFrameworkPath !== null
  )
    throw new Error(
      "Reset all did not return the active learner to a clean Day 1 state",
    );

  const responsiveViews = [
    "Home",
    "Lessons",
    "Learning Path",
    "Resources",
    "Practice",
    "Quizzes",
    "Projects",
    "Advanced Labs",
    "Portfolio",
    "Interview Prep",
    "My Notes",
    "Review",
    "My Progress",
    "Certificates",
    "AI Help",
  ];
  const responsiveViewports = [
    { width: 1440, height: 900, theme: "dark" },
    { width: 1280, height: 800, theme: "light" },
    { width: 1024, height: 768, theme: "dark" },
    { width: 768, height: 1024, theme: "light" },
    { width: 390, height: 844, theme: "dark" },
    { width: 320, height: 568, theme: "light" },
  ];
  for (const viewport of responsiveViewports) {
    await page.setViewport({ width: viewport.width, height: viewport.height });
    await page.evaluate((theme) => {
      localStorage.setItem("forge-theme", theme);
    }, viewport.theme);
    await page.reload({ waitUntil: "networkidle0" });
    for (const view of responsiveViews) {
      const focused = await page.$(".learning-focus");
      if (focused) {
        await page.click(".learning-focus .back-link");
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      if (viewport.width <= 900) await page.click(".menu-button");
      await clickText(view);
      await expectNoHorizontalOverflow(
        `${view} at ${viewport.width}x${viewport.height} in ${viewport.theme} mode`,
      );
      await expectPlainEnglish(
        `${view} at ${viewport.width}x${viewport.height} in ${viewport.theme} mode`,
      );
      await expectNamedButtons(
        `${view} at ${viewport.width}x${viewport.height} in ${viewport.theme} mode`,
      );
    }
    const focused = await page.$(".learning-focus");
    if (focused) {
      await page.click(".learning-focus .back-link");
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    if (viewport.width <= 900) await page.click(".menu-button");
    await clickText("Learning Path");
    await page.click('button[aria-label="Open Orientation & Developer Setup"]');
    await clickText("Hardware, memory and storage");
    await expectText("COURSE TOPICS");
    await expectFocusedLearningShell(
      `Catalog lesson at ${viewport.width}x${viewport.height}`,
    );
    await expectNoHorizontalOverflow(
      `Focused catalog lesson at ${viewport.width}x${viewport.height} in ${viewport.theme} mode`,
    );
    await expectNamedButtons(
      `Focused catalog lesson at ${viewport.width}x${viewport.height}`,
    );
  }

  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  console.log(
    "Smoke test passed: Markdown Notes 2.0 with tags, links, favorites, flashcards, and review actions; global multi-source search, eight command actions, evidence notifications, meaningful progress analytics, ten-skill evidence matrix, opt-in portfolio preview, four advanced engineering labs, saved lab evidence, evidence-based mastery, weak-signal spaced reviews, focused learning shell, unique npm chapters, saved interactive examples, named icon controls, project action icons, course-topic controls, framework paths, learning resources, topic practice, persistence, quizzes, certificates, plain-English checks, 90 primary responsive checks, and six focused lesson viewport checks.",
  );
} finally {
  await browser.close();
}
