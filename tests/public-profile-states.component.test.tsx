import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicProfile } from "../src/Portfolio";
import { ForgeApiError, forgeApi, type PublicPortfolio } from "../src/services/forgeApi";

const portfolio: PublicPortfolio = {
  username: "forge_learner",
  fullName: "Forge Learner",
  published: true,
  about: "Building reliable learning projects.",
  skills: [],
  projects: [],
  caseStudies: [],
  certificates: [],
  updatedAt: "2026-09-25T00:00:00.000Z",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PublicProfile states", () => {
  it("distinguishes an unavailable profile from a failed service", async () => {
    vi.spyOn(forgeApi, "publicPortfolio").mockRejectedValue(
      new ForgeApiError(404, "NOT_FOUND", "Missing"),
    );
    render(<PublicProfile username="missing" />);

    expect(await screen.findByText("Portfolio not available")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("preserves an actionable retry after a temporary failure", async () => {
    const request = vi
      .spyOn(forgeApi, "publicPortfolio")
      .mockRejectedValueOnce(new ForgeApiError(503, "UNAVAILABLE", "Later"))
      .mockResolvedValueOnce({ portfolio });
    render(<PublicProfile username="forge_learner" />);

    const retry = await screen.findByRole("button", { name: /try again/i });
    fireEvent.click(retry);

    await waitFor(() =>
      expect(screen.getByText("Forge Learner")).toBeTruthy(),
    );
    expect(request).toHaveBeenCalledTimes(2);
  });
});
