// Run explicitly for the existing Forge account; never print credentials or secrets.
import { execFileSync } from "node:child_process";
const account = "af93b360658e7749c259e3889a77d6a5";
const worker = "forge-ai-engineering";
const hostname = "forge-ai-engineering.taufiqueansari895.workers.dev";
const name = "Forge account protection";
const auth = JSON.parse(
  execFileSync("./node_modules/.bin/wrangler", ["auth", "token", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 30000,
  }),
);
if (!auth.token || !["oauth", "api_token"].includes(auth.type))
  throw new Error("Cloudflare account authentication is required.");
async function api(path, method = "GET", body) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}${path}`,
    {
      method,
      headers: {
        authorization: `Bearer ${auth.token}`,
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30000),
    },
  );
  const data = await response.json();
  if (!response.ok || !data.success)
    throw new Error(
      `Cloudflare ${method} request failed (${response.status}); no secret details logged.`,
    );
  return data.result;
}
const widgets = await api(
  `/challenges/widgets?filter=${encodeURIComponent(`name:${name}`)}`,
);
const matching = widgets.filter((widget) => widget.name === name);
if (matching.length > 1)
  throw new Error(
    "Multiple Forge widgets found; refusing an ambiguous change.",
  );
const widget = matching.length
  ? await api(`/challenges/widgets/${matching[0].sitekey}`)
  : await api("/challenges/widgets", "POST", {
      name,
      mode: "managed",
      domains: [hostname],
    });
if (
  widget.mode !== "managed" ||
  widget.domains.length !== 1 ||
  widget.domains[0] !== hostname ||
  !widget.secret
)
  throw new Error(
    "Forge widget policy or secret does not match the expected configuration.",
  );
await api(`/workers/scripts/${worker}/secrets`, "PUT", {
  name: "TURNSTILE_SECRET_KEY",
  type: "secret_text",
  text: widget.secret,
});
console.log(
  JSON.stringify({
    sitekey: widget.sitekey,
    hostname,
    mode: widget.mode,
    workerSecretStored: true,
  }),
);
