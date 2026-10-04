import App from "../App";
import { EmailLinkPage } from "../features/account/AccountEmail";

export function ForgeRoot() {
  if (
    import.meta.env.DEV &&
    window.location.hostname === "127.0.0.1" &&
    new URLSearchParams(window.location.search).has("forge-error-boundary-test")
  )
    throw new Error("Intentional local error-boundary verification");
  return window.location.pathname === "/account/email" ? (
    <EmailLinkPage />
  ) : (
    <App />
  );
}
