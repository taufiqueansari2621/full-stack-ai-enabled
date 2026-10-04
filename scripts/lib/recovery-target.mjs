export const FORGE_ACCOUNT = "af93b360658e7749c259e3889a77d6a5";
export const PRODUCTION_DATABASE = "6587d47b-fef4-4173-a64e-6904da7e018e";
export const RECOVERY_SNAPSHOT = {
  knowledge: [
    {
      id: "drill-note",
      title: "Recovery fixture",
      body: "Synthetic baseline",
      topic: "backup",
      updatedAt: "2026-10-04T00:00:00Z",
    },
  ],
  completedLessons: ["drill-topic"],
};

export function parseWranglerJson(output) {
  // File imports can prepend human-readable progress even with --json.
  const lines = output.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:\{|\[\s*(?:\{|\]|$))/.test(lines[i].trim())) {
      return JSON.parse(lines.slice(i).join("\n"));
    }
  }
  throw new Error("No complete Wrangler JSON result");
}

export function validateRecoveryTarget(
  name,
  id,
  databases,
  account = FORGE_ACCOUNT,
) {
  if (account !== FORGE_ACCOUNT)
    throw new Error("Unexpected Cloudflare account");
  if (typeof name !== "string" || !/^forge-restore-drill-\d{8}$/.test(name))
    throw new Error(
      "Only an explicitly named synthetic recovery database is allowed",
    );
  if (
    typeof id !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
      id,
    ) ||
    id === PRODUCTION_DATABASE
  )
    throw new Error("Invalid or production database ID");
  if (
    !Array.isArray(databases) ||
    databases.filter((db) => db.name === name && db.uuid === id).length !== 1
  )
    throw new Error(
      "Database name and ID must exactly match the remote inventory",
    );
  return { name, id };
}
