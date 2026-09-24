import { describe, expect, it } from "vitest";
import {
  systemDesignComponents,
  systemDesignPrompts,
  systemDesignScenarios,
} from "../src/domain/systemDesignScenarios";

describe("system design lab catalog", () => {
  it("covers every required practice system", () => {
    expect(systemDesignScenarios.map((item) => item.title)).toEqual([
      "URL Shortener",
      "Chat Application",
      "Notification Service",
      "E-commerce Platform",
      "Video Platform",
      "Search System",
      "AI RAG Platform",
    ]);
    for (const scenario of systemDesignScenarios) {
      expect(scenario.brief.length).toBeGreaterThan(40);
      expect(scenario.starterNodes.length).toBeGreaterThanOrEqual(5);
      expect(
        scenario.starterNodes.every((node) =>
          systemDesignComponents.includes(
            node as (typeof systemDesignComponents)[number],
          ),
        ),
      ).toBe(true);
    }
  });

  it("provides every component and explanation prompt from the brief", () => {
    expect(systemDesignComponents).toHaveLength(12);
    expect(systemDesignPrompts).toEqual([
      "scaling",
      "availability",
      "consistency",
      "security",
      "failure handling",
      "cost",
      "trade-offs",
    ]);
  });
});
