export type WorkspaceFiles = Record<string, string>;
export const MAX_WORKSPACE_FILES = 12;

export function validateWorkspacePath(path: string): void {
  if (
    !/^[a-zA-Z0-9_.\-/]{1,80}$/.test(path) ||
    path.includes("..") ||
    path
      .split("/")
      .some((part) =>
        ["", ".", "__proto__", "prototype", "constructor"].includes(part),
      )
  )
    throw new Error(
      "Use a relative path up to 80 characters with letters, numbers, dots, dashes, or underscores.",
    );
}

export function validateWorkspaceFiles(files: WorkspaceFiles): void {
  const paths = Object.keys(files);
  if (paths.length < 1 || paths.length > MAX_WORKSPACE_FILES)
    throw new Error(`A workspace supports 1–${MAX_WORKSPACE_FILES} files.`);
  for (const path of paths) {
    validateWorkspacePath(path);
    if (typeof files[path] !== "string" || files[path].length > 120_000)
      throw new Error("Each file must be text under 120 KB.");
    if (paths.some((other) => other.startsWith(`${path}/`)))
      throw new Error("A path cannot be both a file and a folder.");
  }
  if (new TextEncoder().encode(JSON.stringify(files)).byteLength > 512_000)
    throw new Error("Workspace exceeds 512 KB. Export or shorten files first.");
}

export function addWorkspaceFile(
  files: WorkspaceFiles,
  path: string,
  content = "",
): WorkspaceFiles {
  validateWorkspacePath(path);
  if (Object.hasOwn(files, path))
    throw new Error("A file already exists at that path.");
  const next = { ...files, [path]: content };
  validateWorkspaceFiles(next);
  return next;
}

export function moveWorkspacePath(
  files: WorkspaceFiles,
  from: string,
  to: string,
): {
  files: WorkspaceFiles;
  paths: Record<string, string>;
} {
  validateWorkspacePath(from);
  validateWorkspacePath(to);
  const moved = Object.keys(files).filter(
    (path) => path === from || path.startsWith(`${from}/`),
  );
  if (!moved.length) throw new Error("Choose an existing file or folder.");
  if (from === to) throw new Error("Choose a different destination path.");
  if (to.startsWith(`${from}/`))
    throw new Error("A folder cannot move inside itself.");
  if (
    Object.keys(files).some(
      (path) =>
        !moved.includes(path) && (path === to || path.startsWith(`${to}/`)),
    )
  )
    throw new Error("The destination already exists. Choose a new path.");
  const paths = Object.fromEntries(
    moved.map((path) => [path, to + path.slice(from.length)]),
  );
  const next = Object.fromEntries(
    Object.entries(files).map(([path, content]) => [
      Object.hasOwn(paths, path) ? paths[path] : path,
      content,
    ]),
  );
  validateWorkspaceFiles(next);
  return { files: next, paths };
}

export function removeWorkspaceFile(
  files: WorkspaceFiles,
  path: string,
): WorkspaceFiles {
  if (!Object.hasOwn(files, path)) throw new Error("Choose an existing file.");
  const next = Object.fromEntries(
    Object.entries(files).filter(([key]) => key !== path),
  );
  validateWorkspaceFiles(next);
  return next;
}
