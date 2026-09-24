export const API_VERSION = "1";

export function normalizeApiPath(pathname: string) {
  if (pathname === "/api/v1") return "/api";
  if (pathname.startsWith("/api/v1/"))
    return `/api/${pathname.slice("/api/v1/".length)}`;
  return pathname;
}
