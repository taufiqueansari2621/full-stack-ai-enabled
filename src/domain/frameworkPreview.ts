export type PreviewBuild = {
  entry: string;
  modules: Record<string, string>;
  imports: Record<string, Record<string, string>>;
  styles: string;
  diagnostics: string[];
};
export const FRAMEWORK_PACKAGES = [
  "react",
  "react-dom/client",
  "react/jsx-runtime",
  "@angular/core",
  "@angular/common",
  "@angular/platform-browser",
  "rxjs",
];
export function resolveWorkspacePath(
  from: string,
  specifier: string,
  files: Record<string, string>,
): string | null {
  if (!specifier.startsWith(".")) return null;
  const parts = from.split("/").slice(0, -1);
  for (const part of specifier.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(part);
  }
  const path = parts.join("/");
  return (
    [
      path,
      ...[
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        "/index.ts",
        "/index.tsx",
        "/index.js",
        "/index.jsx",
      ].map((ext) => path + ext),
    ].find((key) => Object.hasOwn(files, key)) ?? null
  );
}
