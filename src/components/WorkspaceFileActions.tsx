import { useState } from "react";
import {
  addWorkspaceFile,
  moveWorkspacePath,
  removeWorkspaceFile,
  type WorkspaceFiles,
} from "../domain/workspaceFiles";

export function WorkspaceFileActions({
  files,
  activePath,
  onChange,
}: {
  files: WorkspaceFiles;
  activePath: string;
  onChange: (
    files: WorkspaceFiles,
    activePath: string,
    paths?: Record<string, string>,
  ) => void;
}) {
  const [mode, setMode] = useState<"create" | "move" | "delete" | null>(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [deleted, setDeleted] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const paths = [
    ...new Set(
      Object.keys(files).flatMap((path) => {
        const parts = path.split("/");
        return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
      }),
    ),
  ].sort();
  const attempt = (operation: () => void) => {
    try {
      operation();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "File operation failed. Files unchanged.",
      );
    }
  };
  return (
    <section
      className="workspace-file-actions"
      aria-label="Manage workspace files"
    >
      <div>
        <button
          onClick={() => {
            setMode("create");
            setDestination("");
            setMessage("");
          }}
        >
          New file
        </button>
        <button
          onClick={() => {
            setMode("move");
            setSource(activePath);
            setDestination(activePath);
            setMessage("");
          }}
        >
          Rename / move
        </button>
        <button
          onClick={() => {
            setMode("delete");
            setSource(activePath);
            setMessage("");
          }}
        >
          Delete file
        </button>
      </div>
      {mode && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            attempt(() => {
              if (mode === "create") {
                const path = destination.trim();
                onChange(addWorkspaceFile(files, path), path);
                setMessage(`Created ${path}.`);
              } else if (mode === "move") {
                const path = destination.trim();
                const moved = moveWorkspacePath(files, source, path);
                onChange(
                  moved.files,
                  Object.hasOwn(moved.paths, activePath)
                    ? moved.paths[activePath]
                    : activePath,
                  moved.paths,
                );
                setMessage(
                  `Moved ${source} to ${path}. Update imports or references if needed.`,
                );
              } else {
                const next = removeWorkspaceFile(files, source);
                setDeleted({ path: source, content: files[source] });
                onChange(
                  next,
                  activePath === source ? Object.keys(next)[0] : activePath,
                );
                setMessage(
                  `Deleted ${source}. Undo is available until you leave this workspace or delete another file.`,
                );
              }
              setMode(null);
            });
          }}
        >
          {mode === "move" && (
            <label>
              File or folder
              <select
                aria-label="File or folder to move"
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setDestination(event.target.value);
                }}
              >
                {paths.map((path) => (
                  <option key={path} value={path}>
                    {path}
                    {Object.hasOwn(files, path) ? "" : "/"}
                  </option>
                ))}
              </select>
            </label>
          )}
          {mode !== "delete" ? (
            <label>
              {mode === "create" ? "New file path" : "Destination path"}
              <input
                aria-label={
                  mode === "create" ? "New file path" : "Destination path"
                }
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                maxLength={80}
                required
                placeholder="src/features/example.ts"
              />
            </label>
          ) : (
            <p>
              Delete {source}? Export or save a snapshot to retain a durable
              copy.
            </p>
          )}
          <button type="submit">
            {mode === "delete"
              ? "Confirm delete"
              : mode === "create"
                ? "Create file"
                : "Apply move"}
          </button>
          <button type="button" onClick={() => setMode(null)}>
            Cancel file operation
          </button>
        </form>
      )}
      {deleted && (
        <button
          onClick={() =>
            attempt(() => {
              onChange(
                addWorkspaceFile(files, deleted.path, deleted.content),
                deleted.path,
              );
              setMessage(`Restored ${deleted.path}.`);
              setDeleted(null);
            })
          }
        >
          Undo delete
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
