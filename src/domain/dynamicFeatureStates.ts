export type DynamicStateMode =
  | "visible"
  | "synchronous"
  | "browser-native"
  | "not-applicable";

export type DynamicStateEvidence = {
  mode: DynamicStateMode;
  evidence: string;
};

export type DynamicFeatureStateCoverage = {
  id: string;
  feature: string;
  loading: DynamicStateEvidence;
  empty: DynamicStateEvidence;
  error: DynamicStateEvidence;
  retry: DynamicStateEvidence;
  offline: DynamicStateEvidence;
};

const visible = (evidence: string): DynamicStateEvidence => ({
  mode: "visible",
  evidence,
});
const synchronous = (evidence: string): DynamicStateEvidence => ({
  mode: "synchronous",
  evidence,
});
const browserNative = (evidence: string): DynamicStateEvidence => ({
  mode: "browser-native",
  evidence,
});
const notApplicable = (evidence: string): DynamicStateEvidence => ({
  mode: "not-applicable",
  evidence,
});

export const dynamicFeatureStateMatrix: DynamicFeatureStateCoverage[] = [
  {
    id: "account",
    feature: "Cloud account and session",
    loading: visible("Account actions disable and identify the active request."),
    empty: visible("Signed-out users receive local-profile and account choices."),
    error: visible("Account failures render an alert without clearing form input."),
    retry: visible("The same preserved form can be submitted again."),
    offline: visible("Cloud failure explains that local learning still works."),
  },
  {
    id: "onboarding",
    feature: "Onboarding and diagnostic roadmap",
    loading: visible("The final action shows roadmap creation progress."),
    empty: visible("Every step starts with an explicit unanswered choice."),
    error: visible("Profile-save failures remain on the current step with an alert."),
    retry: visible("The learner can submit the preserved onboarding answers again."),
    offline: visible("Local learning remains available when cloud profile save fails."),
  },
  {
    id: "progress-sync",
    feature: "Cross-device learning progress",
    loading: visible("Cloud hydration and saves have loading/saving states."),
    empty: visible("A missing cloud snapshot offers explicit local import."),
    error: visible("Revision conflicts have a dedicated alert and choices."),
    retry: visible("Retry sync, use cloud, and keep-device actions are available."),
    offline: visible("Offline edits remain local and reconnect retries pending work."),
  },
  {
    id: "workspace",
    feature: "Workspace, runner, and snapshots",
    loading: visible("Lazy route, AI, saving, and runner activity are labelled."),
    empty: visible("New files, console, results, and snapshot history explain emptiness."),
    error: visible("Runner, AI, snapshot, and cloud-save errors stay visible."),
    retry: visible("Run, regenerate, resave, reopen history, and sync actions retry work."),
    offline: visible("Local autosave/export continue while cloud save reports offline."),
  },
  {
    id: "portfolio",
    feature: "Private and public portfolio",
    loading: visible("Public profile loading and private draft saving are explicit."),
    empty: visible("Private, unknown, and evidence-free portfolios explain next steps."),
    error: visible("Public/server and publish failures have distinct error messages."),
    retry: visible("Public loading and draft publishing expose retry actions."),
    offline: visible("Public profiles request reconnection; private evidence stays local."),
  },
  {
    id: "certificates",
    feature: "Certificate issuance and verification",
    loading: visible("Issuance and public verification display progress."),
    empty: visible("Unmet evidence requirements list the remaining work."),
    error: visible("Invalid credentials and issuance failures are explained."),
    retry: visible("Verification and eligible issuance can be requested again."),
    offline: visible("Offline credentials remain explicitly labelled local-only."),
  },
  {
    id: "search-resources-notifications",
    feature: "Search, resources, and notifications",
    loading: synchronous("Local indexes and reviewed metadata filter synchronously."),
    empty: visible("No-result and nothing-needs-attention states are explicit."),
    error: notApplicable("No remote query runs in these local catalog surfaces."),
    retry: visible("Clearing filters or changing the query immediately retries."),
    offline: visible("Visited resources remain in the PWA; external links stay optional."),
  },
  {
    id: "lesson-media",
    feature: "Lazy lessons and curated media",
    loading: visible("Lazy lesson/resource chunks and video frames identify loading."),
    empty: visible("Lessons without a matching video retain documentation and practice."),
    error: visible("A direct source link remains when an external embed cannot load."),
    retry: browserNative("The player or direct source can be loaded again by the browser."),
    offline: visible("Cached lesson text remains available; external media stays optional."),
  },
  {
    id: "local-learning",
    feature: "Practice, reviews, notes, labs, and analytics",
    loading: synchronous("Learner-scoped evidence is read synchronously from local state."),
    empty: visible("Each surface explains how to create its first evidence record."),
    error: visible("Validation and safe-storage recovery keep state actionable."),
    retry: visible("Checks, quizzes, reviews, filters, and saves can be repeated safely."),
    offline: notApplicable("These local-first workflows are designed to work offline."),
  },
];
