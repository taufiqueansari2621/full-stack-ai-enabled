import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AccountSessions from "../src/AccountSessions";
import { forgeApi } from "../src/services/forgeApi";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("requires confirmation and preserves the current session controls", async () => {
  vi.spyOn(forgeApi, "activeSessions").mockResolvedValue({
    sessions: [
      {
        id: "current",
        current: true,
        createdAt: "2026-01-01",
        expiresAt: "2027-01-01",
      },
      {
        id: "other",
        current: false,
        createdAt: "2026-01-01",
        expiresAt: "2027-01-01",
      },
    ],
    truncated: false,
  });
  const revoke = vi
    .spyOn(forgeApi, "revokeSessions")
    .mockResolvedValue({ ok: true });
  render(<AccountSessions />);
  fireEvent.click(screen.getByText("Load active sessions"));
  await screen.findByText("Current session");
  expect(screen.getAllByText("Revoke this session")).toHaveLength(1);
  fireEvent.click(screen.getByText("Revoke this session"));
  expect(revoke).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Cancel revocation"));
  expect(revoke).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Revoke all other sessions"));
  fireEvent.click(screen.getByText("Confirm revocation"));
  await screen.findByText(/Revocation saved/);
  expect(revoke).toHaveBeenCalledWith({ scope: "others" });
});
it("explains offline state without issuing requests", async () => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  const request = vi.spyOn(forgeApi, "activeSessions");
  render(<AccountSessions />);
  fireEvent.click(screen.getByText("Load active sessions"));
  expect((await screen.findByRole("alert")).textContent).toContain("Offline");
  expect(request).not.toHaveBeenCalled();
});
