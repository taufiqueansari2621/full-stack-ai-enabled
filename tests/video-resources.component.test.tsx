import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TopicResourcesPanel from "../src/TopicResourcesPanel";
import { learningResources } from "../src/learningResourceCatalog";

afterEach(() => cleanup());

describe("reviewed learning resources", () => {
  it("provides the required dynamic metadata for every catalog record", () => {
    expect(learningResources.length).toBeGreaterThan(70);
    for (const resource of learningResources) {
      expect(resource.topic.length).toBeGreaterThan(0);
      expect(resource.difficulty.length).toBeGreaterThan(0);
      expect(resource.duration.length).toBeGreaterThan(0);
      expect(resource.resourceType).toBe(resource.kind);
      expect(resource.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["Reviewed", "Review due"]).toContain(resource.qualityStatus);
    }
  });

  it("embeds a legitimate video for a matching lesson with a direct-link fallback", () => {
    const { container } = render(
      <TopicResourcesPanel phaseId="javascript" topic="Event loop" />,
    );

    const frame = screen.getByTitle("In The Loop") as HTMLIFrameElement;
    expect(frame.src).toBe(
      "https://www.youtube-nocookie.com/embed/cCOL7MC4Pl0",
    );
    expect(frame.getAttribute("loading")).toBe("lazy");
    expect(screen.getByText("35m")).toBeTruthy();
    expect(screen.getAllByText(/Reviewed 2026-09-25/).length).toBeGreaterThan(0);
    expect(
      container.querySelector('a[href="https://www.youtube.com/watch?v=cCOL7MC4Pl0"]'),
    ).toBeTruthy();
  });
});
