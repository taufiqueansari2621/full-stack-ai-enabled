import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../src/app/ErrorBoundary";

afterEach(() => cleanup());

describe("ErrorBoundary", () => {
  it("renders its child content while the application is healthy", () => {
    render(
      <ErrorBoundary>
        <p>Learning is ready.</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Learning is ready.")).toBeTruthy();
  });

  it("keeps a recoverable, accessible fallback when a child render fails", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const BrokenScreen = () => {
      throw new Error("fixture failure");
    };

    render(
      <ErrorBoundary>
        <BrokenScreen />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "This screen could not finish loading." }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reload Forge" })).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
    consoleError.mockRestore();
  });
});
