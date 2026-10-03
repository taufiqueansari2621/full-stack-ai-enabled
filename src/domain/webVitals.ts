export const VITAL_ROUTES = [
  "home",
  "learn",
  "roadmap",
  "resources",
  "practice",
  "quizzes",
  "reviews",
  "workspace",
  "projects",
  "interview",
  "knowledge",
  "progress",
  "mentor",
  "advanced",
  "portfolio",
  "public-profile",
  "certificate",
  "other",
] as const;
export type VitalReport = {
  version: 1;
  consent: true;
  name: "LCP" | "CLS" | "INP";
  value: number;
  route: (typeof VITAL_ROUTES)[number];
  device: "mobile" | "tablet" | "desktop";
};

export function coarseVitalRoute(pathname: string): VitalReport["route"] {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/u/")) return "public-profile";
  if (pathname.startsWith("/certificate/")) return "certificate";
  const route = pathname.replace(/^\//, "");
  return VITAL_ROUTES.includes(route as VitalReport["route"])
    ? (route as VitalReport["route"])
    : "other";
}

export function parseVitalReport(input: unknown): VitalReport | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  const keys = ["version", "consent", "name", "value", "route", "device"];
  if (
    Object.keys(data).length !== keys.length ||
    Object.keys(data).some((key) => !keys.includes(key))
  )
    return null;
  if (data.version !== 1 || data.consent !== true) return null;
  if (data.name !== "LCP" && data.name !== "CLS" && data.name !== "INP")
    return null;
  if (
    typeof data.value !== "number" ||
    !Number.isFinite(data.value) ||
    data.value < 0 ||
    data.value > (data.name === "CLS" ? 10 : 60_000)
  )
    return null;
  if (
    !VITAL_ROUTES.includes(data.route as VitalReport["route"]) ||
    !["mobile", "tablet", "desktop"].includes(data.device as string)
  )
    return null;
  return {
    version: 1,
    consent: true,
    name: data.name,
    value: Number(data.value.toFixed(data.name === "CLS" ? 4 : 1)),
    route: data.route as VitalReport["route"],
    device: data.device as VitalReport["device"],
  };
}

export function vitalRating({ name, value }: VitalReport) {
  const [good, poor] =
    name === "CLS" ? [0.1, 0.25] : name === "INP" ? [200, 500] : [2500, 4000];
  return value <= good ? "good" : value <= poor ? "needs-improvement" : "poor";
}
