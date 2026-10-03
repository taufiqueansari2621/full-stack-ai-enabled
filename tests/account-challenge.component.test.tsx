import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AccountChallenge } from "../src/AccountChallenge";
import { forgeApi } from "../src/services/forgeApi";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete window.turnstile;
});
it("allows an unconfigured local form without loading an external SDK", async () => {
  vi.spyOn(forgeApi, "accountSecurityConfig").mockResolvedValue({
    turnstileSiteKey: null,
  });
  const verified = vi.fn();
  render(<AccountChallenge action="login" onVerified={verified} />);
  await waitFor(() => expect(verified).toHaveBeenLastCalledWith(""));
  expect(
    document.querySelector('script[src*="challenges.cloudflare.com"]'),
  ).toBeNull();
});
it("requires a token, invalidates expiry, retries and cleans up its widget", async () => {
  vi.spyOn(forgeApi, "accountSecurityConfig").mockResolvedValue({
    turnstileSiteKey: "public",
  });
  const renderWidget = vi.fn<NonNullable<Window["turnstile"]>["render"]>(
    () => "widget",
  );
  const remove = vi.fn();
  window.turnstile = { render: renderWidget, remove };
  const verified = vi.fn();
  const view = render(
    <AccountChallenge action="register" onVerified={verified} />,
  );
  await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
  expect(verified).toHaveBeenLastCalledWith(null);
  const options = renderWidget.mock.calls[0][1];
  expect(options.action).toBe("register");
  act(() => options.callback("fresh-token"));
  expect(verified).toHaveBeenLastCalledWith("fresh-token");
  act(() => options["expired-callback"]());
  expect(verified).toHaveBeenLastCalledWith(null);
  fireEvent.click(screen.getByText("Retry security check"));
  await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(2));
  expect(remove).toHaveBeenCalledWith("widget");
  act(() => renderWidget.mock.calls[1][1]["error-callback"]());
  expect((await screen.findByRole("alert")).textContent).toContain("failed");
  view.unmount();
  expect(remove).toHaveBeenCalledTimes(2);
  act(() => options.callback("late-token"));
  expect(verified).toHaveBeenLastCalledWith(null);
});
it("does not bypass unavailable configuration and allows retry", async () => {
  const config = vi
    .spyOn(forgeApi, "accountSecurityConfig")
    .mockRejectedValue(new Error("offline"));
  const verified = vi.fn();
  render(<AccountChallenge action="recover" onVerified={verified} />);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Local learning still works",
  );
  expect(verified).toHaveBeenLastCalledWith(null);
  config.mockResolvedValue({ turnstileSiteKey: null });
  fireEvent.click(screen.getByText("Retry security check"));
  await waitFor(() => expect(verified).toHaveBeenLastCalledWith(""));
});
