import { useState } from "react";
import {
  getPerformanceConsent,
  setPerformanceConsent,
} from "./data/performanceConsent";

export function PerformancePreference() {
  const [enabled, setEnabled] = useState(getPerformanceConsent);
  const [message, setMessage] = useState("");
  return (
    <div className="setting-row performance-preference">
      <div>
        <b>Help improve page speed</b>
        <span>
          Optional speed, layout and response measurements sent to Forge on
          Cloudflare. No account details, learning work or full URLs. Cloudflare
          still receives request metadata. Off by default; this browser only.
        </span>
        {message && <span role="status">{message}</span>}
      </div>
      <label className="performance-control">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            const next = event.target.checked;
            const saved = setPerformanceConsent(next);
            setEnabled(saved ? next : false);
            setMessage(
              saved
                ? next
                  ? "Enabled. Reload to start sharing measurements."
                  : "Disabled. No further measurements will be sent."
                : "Could not save this preference. Sharing stopped for this page; check browser storage before reloading.",
            );
          }}
        />
        Share performance
      </label>
    </div>
  );
}
