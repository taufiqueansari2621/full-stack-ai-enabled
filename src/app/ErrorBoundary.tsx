import { Component, type ErrorInfo, type ReactNode } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Forge application render failed", {
      name: error.name,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="fatal-error" role="alert">
        <div className="panel">
          <CircleAlert aria-hidden="true" />
          <span className="eyebrow">FORGE RECOVERY</span>
          <h1>This screen could not finish loading.</h1>
          <p>
            Your saved learning work is still stored. Reload Forge to restore
            the latest safe state.
          </p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            <RotateCcw aria-hidden="true" /> Reload Forge
          </button>
        </div>
      </main>
    );
  }
}
