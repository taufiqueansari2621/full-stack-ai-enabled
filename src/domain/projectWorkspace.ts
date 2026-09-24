export const projectBriefSections = [
  "Problem", "Requirements", "User Stories", "Architecture", "Data Model",
  "API Design", "Security Requirements", "Accessibility",
  "Performance Requirements", "Milestones", "Tasks", "Acceptance Criteria",
  "Tests", "Deployment", "Documentation", "Retrospective",
] as const;

const sectionGuidance: Record<(typeof projectBriefSections)[number], string> = {
  Problem: "Name the learner or customer problem and the measurable outcome.",
  Requirements: "Separate must-have behavior from explicit non-goals.",
  "User Stories": "Describe who needs each capability, why, and the expected value.",
  Architecture: "Map components, responsibilities, data flow, and failure boundaries.",
  "Data Model": "Define entities, ownership, relationships, constraints, and retention.",
  "API Design": "Specify inputs, outputs, errors, authentication, and versioning.",
  "Security Requirements": "Threat-model identity, authorization, validation, secrets, and abuse.",
  Accessibility: "Set keyboard, semantics, focus, contrast, and assistive-technology checks.",
  "Performance Requirements": "Choose measurable response, load, and bundle budgets.",
  Milestones: "Split delivery into independently testable outcomes.",
  Tasks: "Turn the next milestone into small, verifiable implementation steps.",
  "Acceptance Criteria": "Write observable pass/fail conditions for the core user journey.",
  Tests: "Cover unit rules, boundaries, failures, and one real browser journey.",
  Deployment: "Document environments, release gates, observability, and rollback.",
  Documentation: "Maintain setup, architecture, API, operations, and user guidance.",
  Retrospective: "Record evidence, surprises, trade-offs, debt, and the next improvement.",
};

export function buildProjectBrief(title: string) {
  return projectBriefSections.map((section) => ({
    section,
    prompt: `${title}: ${sectionGuidance[section]}`,
  }));
}
