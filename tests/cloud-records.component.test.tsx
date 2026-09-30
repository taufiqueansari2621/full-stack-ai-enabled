import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CloudLearningRecords from "../src/CloudLearningRecords";
import { forgeApi } from "../src/services/forgeApi";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("cloud record states", () => {
  it("loads independent project milestone records", async () => {
    vi.spyOn(forgeApi, "projectRecords").mockResolvedValue({
      records: [
        { id: "p05", updatedAt: "2026-09-29", completedTaskIds: ["design"] },
      ],
      next: null,
    });
    render(<CloudLearningRecords />);
    fireEvent.click(screen.getByText("Load cloud records"));
    expect(await screen.findByText("Project p05")).toBeTruthy();
    expect(screen.getByText(/1 completed milestones: design/)).toBeTruthy();
  });
  it("shows empty records and recovers from a fetch error", async () => {
    vi.spyOn(forgeApi, "projectRecords")
      .mockRejectedValueOnce(new Error("Temporary error"))
      .mockResolvedValueOnce({ records: [], next: null });
    render(<CloudLearningRecords />);
    fireEvent.click(screen.getByText("Load cloud records"));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Temporary error",
    );
    fireEvent.click(screen.getByText("Load cloud records"));
    expect(
      await screen.findByText("No saved projects on this page yet."),
    ).toBeTruthy();
  });
  it("avoids cloud requests while offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const request = vi.spyOn(forgeApi, "projectRecords");
    render(<CloudLearningRecords />);
    fireEvent.click(screen.getByText("Load cloud records"));
    expect((await screen.findByRole("alert")).textContent).toContain("Offline");
    expect(request).not.toHaveBeenCalled();
  });
});
