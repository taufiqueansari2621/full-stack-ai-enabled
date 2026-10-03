import { parseVitalReport, vitalRating } from "../../src/domain/webVitals";
import { HttpError, json, readJsonObject, type Route } from "../http";
import { enforceRateLimit } from "../rateLimit";

export const webVitalRoutes: Route[] = [
  {
    method: "POST",
    pattern: "/api/metrics/web-vitals",
    async handler({ request, env, url }) {
      if (request.headers.get("origin") !== url.origin)
        throw new HttpError(
          403,
          "ORIGIN_REJECTED",
          "Same-origin reporting required.",
        );
      if (
        request.headers
          .get("content-type")
          ?.split(";")[0]
          .trim()
          .toLowerCase() !== "application/json"
      )
        throw new HttpError(415, "JSON_REQUIRED", "Send application/json.");
      const report = parseVitalReport(await readJsonObject(request, 4096));
      if (!report)
        throw new HttpError(
          400,
          "INVALID_METRIC",
          "Invalid performance measurement.",
        );
      await enforceRateLimit(env, request, "web-vitals", "browser", 60, 3600);
      console.info({
        service: "forge-ai-engineering",
        event: "client_web_vital",
        timestamp: new Date().toISOString(),
        clientReported: true,
        version: report.version,
        name: report.name,
        value: report.value,
        route: report.route,
        device: report.device,
        rating: vitalRating(report),
      });
      return json({ ok: true });
    },
  },
];
