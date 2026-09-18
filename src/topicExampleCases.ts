export type TopicExampleCase = {
  id: "normal" | "unusual" | "failure";
  label: string;
  level: string;
  situation: string;
  action: string;
  expected: string;
  explanation: string;
  nextQuestion: string;
};

type ExampleCaseInput = {
  phaseId: string;
  topic: string;
  moduleTitle: string;
  definition: string;
  realWorld: string;
  example: string;
  practice: string;
  qualityRule: string;
};

type ChangedCase = Omit<TopicExampleCase, "id" | "label" | "level">;

const changedCases = (
  phaseId: string,
  topic: string,
  moduleTitle: string,
  qualityRule: string,
): { unusual: ChangedCase; failure: ChangedCase } => {
  if (phaseId === "web")
    return {
      unusual: {
        situation: `The ${topic} example looks correct on a wide screen. Now it must work at 320px, at 200% zoom, and with only a keyboard.`,
        action: `Use ${topic} without removing meaning, focus order, labels, or content.`,
        expected:
          "The page has no horizontal page scroll, text remains readable, focus stays visible, and every action still works from the keyboard.",
        explanation:
          "Responsive design and accessibility are part of correct behavior, not optional finishing work.",
        nextQuestion: "Which check would catch this problem before release?",
      },
      failure: {
        situation: `The page that uses ${topic} receives missing content, a broken image, and a failed request.`,
        action: "Remove one expected value and inspect the page at phone width.",
        expected:
          "The layout stays usable, helpful fallback content appears, and the user can recover or try again.",
        explanation: qualityRule,
        nextQuestion: "What should the user see, and where should focus move?",
      },
    };

  if (phaseId === "javascript")
    return {
      unusual: {
        situation: `${topic} receives an empty value, then the same action happens twice very quickly.`,
        action: `Trace the values before and after each use of ${topic}.`,
        expected:
          "The code handles the empty value deliberately and repeated actions do not create stale or duplicated results.",
        explanation:
          "JavaScript behavior becomes easier to trust when input, state changes, timing, and visible output are checked separately.",
        nextQuestion: "Which value changes first, and which result can the user see?",
      },
      failure: {
        situation: `A callback, promise, or operation around ${topic} fails halfway through.`,
        action: "Reproduce the smallest failure and inspect the thrown error or rejected promise.",
        expected:
          "The app reports a useful error, leaves state valid, and offers a safe retry when retrying makes sense.",
        explanation: qualityRule,
        nextQuestion: "What test would stop this exact bug from returning?",
      },
    };

  if (phaseId === "typescript")
    return {
      unusual: {
        situation: `${topic} must handle data from an API where an optional value is missing.`,
        action: "Treat outside data as unknown, check it, then narrow it before use.",
        expected:
          "Valid data becomes a safe application type; invalid data produces a clear error instead of an unsafe assertion.",
        explanation:
          "TypeScript checks code during development, but data from a network, file, or user still needs a runtime check.",
        nextQuestion: "Which invalid state should the type make impossible?",
      },
      failure: {
        situation: `A developer uses any or a type assertion to silence an error around ${topic}.`,
        action: "Remove the shortcut and follow the compiler error back to the unsafe boundary.",
        expected:
          "The code models the real states and handles the missing or invalid value explicitly.",
        explanation: qualityRule,
        nextQuestion: "What useful mistake was the compiler trying to show?",
      },
    };

  if (phaseId === "frontend")
    return {
      unusual: {
        situation: `A screen using ${topic} receives a slow response and the user changes pages before it finishes.`,
        action: "Show loading, allow cancellation, and ignore a result that belongs to an old screen.",
        expected:
          "The interface stays responsive and never replaces current data with an old response.",
        explanation:
          "Real interfaces must handle time and user actions, not only the final success state.",
        nextQuestion: "Who owns the request, and when should it be cancelled?",
      },
      failure: {
        situation: `The API behind ${topic} returns an error while the user has unsaved input.`,
        action: "Keep the input, show a useful error, and provide a safe retry.",
        expected:
          "No user work is lost, the problem is understandable, and keyboard focus reaches the recovery action.",
        explanation: qualityRule,
        nextQuestion: "Which visible behavior should an integration test check?",
      },
    };

  if (phaseId === "backend")
    return {
      unusual: {
        situation: `Two users send nearly identical ${topic} requests at the same time.`,
        action: "Check identity, ownership, validation, and how repeated requests affect stored data.",
        expected:
          "Each user can affect only allowed data, and a repeated request cannot create an unsafe duplicate.",
        explanation:
          "Backend correctness includes permissions, timing, and data rules—not only a successful response.",
        nextQuestion: "Which database rule or request key protects this operation?",
      },
      failure: {
        situation: `The database or another service fails during ${topic}.`,
        action: "Trace what finished, what did not, and whether retrying is safe.",
        expected:
          "The API returns one clear error format, logs useful context without secrets, and keeps data valid.",
        explanation: qualityRule,
        nextQuestion: "How would you recover without repeating a completed side effect?",
      },
    };

  if (phaseId === "dsa")
    return {
      unusual: {
        situation: `${topic} receives an empty input, one item, repeated values, and the largest allowed input.`,
        action: "Dry-run each case and count the important operations and extra memory.",
        expected:
          "Every boundary case is correct and the largest input stays within the stated time and memory limits.",
        explanation:
          "An algorithm is not complete until its correctness and resource use match the input limits.",
        nextQuestion: "Which case changes the expected time or memory most?",
      },
      failure: {
        situation: `The ${topic} solution passes small examples but times out or returns the wrong result on hidden input.`,
        action: "Find the smallest failing input, state the invariant, and trace where it breaks.",
        expected:
          "The real cause is fixed and a focused test protects the failing pattern.",
        explanation: qualityRule,
        nextQuestion: "Can you explain why the corrected solution is always valid?",
      },
    };

  if (phaseId === "system-design")
    return {
      unusual: {
        situation: `The system using ${topic} receives ten times more traffic in one region.`,
        action: "Estimate the new load, find the first limit, and choose one measured change.",
        expected:
          "The design identifies the bottleneck, a useful signal, and a safe scaling step without adding unrelated components.",
        explanation:
          "Scale is a number and a failure mode, not a reason to add every distributed-system tool.",
        nextQuestion: "What breaks first, and which measurement proves it?",
      },
      failure: {
        situation: `One dependency in the ${topic} design becomes slow or unavailable.`,
        action: "Trace the failure, timeout, retry, fallback, and recovery path.",
        expected:
          "The failure stays limited, users receive an honest response, and operators can see and recover the problem.",
        explanation: qualityRule,
        nextQuestion: "How do you prevent retries from making the outage worse?",
      },
    };

  if (phaseId === "python")
    return {
      unusual: {
        situation: `${topic} processes an empty file, a missing value, and a much larger data set.`,
        action: "Check types and assumptions at the boundary, then measure time and memory on the larger case.",
        expected:
          "The small cases have clear results and the large case uses resources within an explained limit.",
        explanation:
          "Python code for real work must make data assumptions visible and testable.",
        nextQuestion: "Which value should be rejected before the main work begins?",
      },
      failure: {
        situation: `A file, package, or external service used by ${topic} is unavailable.`,
        action: "Catch only the expected error, keep the original cause, and clean up opened resources.",
        expected:
          "The caller receives a useful error and no file, process, or partial result is left in an unsafe state.",
        explanation: qualityRule,
        nextQuestion: "Which error should be handled here and which should continue upward?",
      },
    };

  if (["machine-learning", "deep-learning"].includes(phaseId))
    return {
      unusual: {
        situation: `${topic} is tested on a small group that behaves differently from the average training data.`,
        action: "Measure results for that group and compare them with a simple baseline.",
        expected:
          "The report shows overall and group-level results, uncertainty, and the errors that matter to the product.",
        explanation:
          "One average score can hide data leakage, class imbalance, or poor results for an important group.",
        nextQuestion: "Which error is most costly, and does the chosen metric show it?",
      },
      failure: {
        situation: `The live data used by ${topic} changes after deployment and model quality falls.`,
        action: "Compare live input and outcome signals with the saved training and validation data.",
        expected:
          "Monitoring detects the change, a safe fallback protects users, and retraining happens only after the cause is understood.",
        explanation: qualityRule,
        nextQuestion: "What signal warns you before users report the problem?",
      },
    };

  if (["llm", "rag", "agents", "full-stack-ai"].includes(phaseId))
    return {
      unusual: {
        situation: `${topic} receives a vague question and the available information is incomplete or conflicting.`,
        action: "Require sources or a structured result, measure confidence, and allow the system to say it cannot answer.",
        expected:
          "The answer separates known facts from uncertainty and never invents access, sources, or completed actions.",
        explanation:
          "A fluent model response is not proof. AI quality must be checked against the product’s real task.",
        nextQuestion: "What result should make the system ask a person for help?",
      },
      failure: {
        situation: `The model or tool used by ${topic} times out, returns invalid data, or tries an unsafe action.`,
        action: "Validate the result, enforce limits and permissions, and use a safe fallback.",
        expected:
          "No unsafe action runs, the user gets an honest recoverable message, and the trace contains enough detail to diagnose the failure.",
        explanation: qualityRule,
        nextQuestion: "Which check must happen before any external action?",
      },
    };

  if (phaseId === "devops")
    return {
      unusual: {
        situation: `A release involving ${topic} works in testing but one live health signal begins to fall.`,
        action: "Pause the release, compare the new and old versions, and check the agreed success signals.",
        expected:
          "The rollout stops before all users are affected and the team has a clear choice to fix forward or undo it.",
        explanation:
          "A safe release has measured gates and a tested recovery path before anything goes wrong.",
        nextQuestion: "Which signal should automatically stop this release?",
      },
      failure: {
        situation: `${topic} fails during a release and the newest version cannot become healthy.`,
        action: "Follow the rollback or recovery steps and preserve logs from the failed version.",
        expected:
          "Service returns to a known good state and the saved information is enough for a useful review.",
        explanation: qualityRule,
        nextQuestion: "How do you prove the recovery is complete?",
      },
    };

  if (phaseId === "career")
    return {
      unusual: {
        situation: `An interviewer asks about ${topic}, then changes one important requirement.`,
        action: "Restate the new need, explain what changes, and keep your answer connected to a real project.",
        expected:
          "The answer stays structured, updates the right decision, and states one benefit and one cost.",
        explanation:
          "Strong interviews test reasoning and communication, not only a memorized first answer.",
        nextQuestion: "Which assumption changed, and which part of your answer must change with it?",
      },
      failure: {
        situation: `You do not know one detail about ${topic} during an interview.`,
        action: "Say what you know, state the gap, reason from first principles, and explain how you would verify it.",
        expected:
          "The answer is honest, useful, and shows a reliable way to reach the missing detail.",
        explanation: qualityRule,
        nextQuestion: "What small example could you use to test your reasoning?",
      },
    };

  return {
    unusual: {
      situation: `${topic} must work with an empty value, repeated action, and a changed requirement in ${moduleTitle}.`,
      action: "Trace the input, the change, and the visible result for each case.",
      expected:
        "Every case has a clear result, and the changed requirement affects only the parts that depend on it.",
      explanation:
        "Unusual cases reveal assumptions that a normal example can hide.",
      nextQuestion: "Which assumption did the normal example leave unstated?",
    },
    failure: {
      situation: `${topic} does not produce the expected result.`,
      action: "Reduce the problem, inspect one clue, test one possible cause, and add a check for the fix.",
      expected:
        "The correction addresses the real cause and the new check fails if the bug returns.",
      explanation: qualityRule,
      nextQuestion: "What is the smallest example that still shows the failure?",
    },
  };
};

const npmCases = (): TopicExampleCase[] => [
  {
    id: "normal",
    label: "Normal case",
    level: "Start here",
    situation:
      "A Vite app needs date-fns in the code that runs for users, and Vitest only while developers run tests.",
    action: "npm install date-fns\nnpm install --save-dev vitest",
    expected:
      "date-fns appears in dependencies, Vitest appears in devDependencies, and package-lock.json records the exact installed tree.",
    explanation:
      "Runtime packages are needed by the running app. Development packages support building, testing, or checking the project.",
    nextQuestion: "Why should package-lock.json be committed with package.json?",
  },
  {
    id: "unusual",
    label: "Unusual case",
    level: "Think deeper",
    situation:
      "A teammate clones the project months later. Newer package versions now match the ranges in package.json.",
    action: "npm ci",
    expected:
      "npm removes any existing install and recreates the exact dependency tree recorded in package-lock.json. It stops if the manifest and lockfile disagree.",
    explanation:
      "npm ci is designed for clean, repeatable installs in automated checks and shared projects.",
    nextQuestion: "When would npm install be correct instead of npm ci?",
  },
  {
    id: "failure",
    label: "Failure case",
    level: "Debug it",
    situation:
      "Installation fails with a peer-dependency conflict after one package is updated.",
    action: "npm explain <package>\nnpm ls <package>\nnpm outdated",
    expected:
      "The developer finds which packages require conflicting versions, checks release notes, and chooses a compatible update instead of forcing an unknown tree.",
    explanation:
      "Deleting the lockfile or using a force flag can hide the conflict and create a different, less repeatable install. Inspect the dependency graph first.",
    nextQuestion: "What test and security check should run before the update is merged?",
  },
];

export const getTopicExampleCases = ({
  phaseId,
  topic,
  moduleTitle,
  definition,
  realWorld,
  example,
  practice,
  qualityRule,
}: ExampleCaseInput): TopicExampleCase[] => {
  if (phaseId === "orientation" && topic.toLowerCase() === "npm and package management")
    return npmCases();

  const changed = changedCases(phaseId, topic, moduleTitle, qualityRule);
  return [
    {
      id: "normal",
      label: "Normal case",
      level: "Start here",
      situation: realWorld,
      action: example || practice,
      expected: `The result matches the goal of ${topic}, and the learner can point to the input, the important change, and the visible output.`,
      explanation: definition,
      nextQuestion: `What is the smallest check that proves ${topic} worked?`,
    },
    {
      id: "unusual",
      label: "Unusual case",
      level: "Think deeper",
      ...changed.unusual,
    },
    {
      id: "failure",
      label: "Failure case",
      level: "Debug it",
      ...changed.failure,
    },
  ];
};
