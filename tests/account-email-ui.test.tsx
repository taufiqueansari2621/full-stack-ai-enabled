import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode } from "react";
import {
  EmailLinkPage,
  EmailVerificationPanel,
} from "../src/features/account/AccountEmail";
import { forgeApi } from "../src/services/forgeApi";
vi.mock("../src/services/forgeApi", () => ({
  forgeApi: {
    emailStatus: vi.fn(),
    sendVerification: vi.fn(),
    consumeEmail: vi.fn(),
    requestEmailReset: vi.fn(),
  },
}));
vi.mock("../src/AccountChallenge", () => ({ AccountChallenge: () => null }));
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  vi.resetAllMocks();
});
describe("email account screens", () => {
  it("strips a fragment in StrictMode without consuming it until confirmation", async () => {
    window.history.replaceState(
      null,
      "",
      `/account/email#verify=${"a".repeat(43)}`,
    );
    vi.mocked(forgeApi.consumeEmail).mockResolvedValue({ ok: true });
    render(
      <StrictMode>
        <EmailLinkPage />
      </StrictMode>,
    );
    expect(window.location.hash).toBe("");
    expect(forgeApi.consumeEmail).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm email verification" }),
    );
    await screen.findByText(
      "Email verified. Email password recovery is now available.",
    );
    expect(forgeApi.consumeEmail).toHaveBeenCalledTimes(1);
  });
  it("shows expired link errors with a route back to Forge", async () => {
    window.history.replaceState(
      null,
      "",
      `/account/email#verify=${"a".repeat(43)}`,
    );
    vi.mocked(forgeApi.consumeEmail).mockRejectedValue(
      new Error("Link expired"),
    );
    render(<EmailLinkPage />);
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm email verification" }),
    );
    await screen.findByText("Link expired");
    expect(
      screen
        .getByRole("link", { name: "Return to Forge" })
        .getAttribute("href"),
    ).toBe("/");
  });
  it("separates pending verification from accepted submission and errors", async () => {
    vi.mocked(forgeApi.emailStatus).mockResolvedValue({
      email: "test@example.invalid",
      verifiedAt: null,
      deliveryConfigured: true,
    });
    vi.mocked(forgeApi.sendVerification).mockRejectedValue(
      new Error("Email unavailable"),
    );
    render(<EmailVerificationPanel />);
    await screen.findByText("test@example.invalid · Not verified");
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification email" }),
    );
    await screen.findByText("Email unavailable");
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Send verification email" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
  });
});
