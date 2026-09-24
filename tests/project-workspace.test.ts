import { describe, expect, it } from "vitest";
import { buildProjectBrief, projectBriefSections } from "../src/domain/projectWorkspace";

describe("project workspace brief", () => {
  it("covers every required project section", () => {
    expect(projectBriefSections).toEqual([
      "Problem", "Requirements", "User Stories", "Architecture", "Data Model",
      "API Design", "Security Requirements", "Accessibility",
      "Performance Requirements", "Milestones", "Tasks", "Acceptance Criteria",
      "Tests", "Deployment", "Documentation", "Retrospective",
    ]);
  });

  it("generates project-specific guidance for every section", () => {
    const brief = buildProjectBrief("Search Experience");
    expect(brief).toHaveLength(16);
    expect(brief.every((item) => item.prompt.startsWith("Search Experience:"))).toBe(true);
  });
});
