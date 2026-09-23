import App from "../App";

export function ForgeRoot() {
  if (
    import.meta.env.DEV &&
    window.location.hostname === "127.0.0.1" &&
    new URLSearchParams(window.location.search).has("forge-error-boundary-test")
  )
    throw new Error("Intentional local error-boundary verification");
  return <App />;
}
