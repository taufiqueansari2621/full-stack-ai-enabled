import { useCallback, useEffect, useRef, useState } from "react";
import { ForgeApiError, forgeApi } from "./services/forgeApi";
import type { ForgeState, ForgeStore } from "./useForgeStore";

type SyncStatus =
  "loading" | "needs-import" | "synced" | "saving" | "offline" | "conflict";

function isForgeState(value: unknown): value is ForgeState {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as { version?: unknown }).version === 1 &&
    Array.isArray((value as { completedLessons?: unknown }).completedLessons),
  );
}

export function useCloudProgress(store: ForgeStore, enabled: boolean) {
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const revision = useRef(0);
  const hydrated = useRef(false);
  const lastSaved = useRef("");
  const { replaceState } = store;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    hydrated.current = false;
    forgeApi
      .progress()
      .then((result) => {
        if (!active) return;
        revision.current = result.revision;
        setUpdatedAt(result.updatedAt);
        if (result.state === null) setStatus("needs-import");
        else if (isForgeState(result.state)) {
          lastSaved.current = JSON.stringify(result.state);
          replaceState(result.state);
          setStatus("synced");
        } else setStatus("conflict");
        hydrated.current = true;
      })
      .catch(() => {
        if (active) setStatus("offline");
      });
    return () => {
      active = false;
    };
  }, [enabled, replaceState]);

  const save = useCallback(async (state: ForgeState) => {
    setStatus("saving");
    try {
      const result = await forgeApi.saveProgress(state, revision.current);
      revision.current = result.revision;
      lastSaved.current = JSON.stringify(state);
      setUpdatedAt(result.updatedAt);
      setStatus("synced");
    } catch (reason) {
      setStatus(
        reason instanceof ForgeApiError && reason.status === 409
          ? "conflict"
          : "offline",
      );
    }
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      !hydrated.current ||
      status === "needs-import" ||
      status === "conflict"
    )
      return;
    const serialized = JSON.stringify(store.state);
    if (serialized === lastSaved.current) return;
    const timer = window.setTimeout(() => void save(store.state), 1_200);
    return () => window.clearTimeout(timer);
  }, [enabled, save, status, store.state]);

  return {
    status,
    updatedAt,
    importLocalProgress: () => save(store.state),
  };
}
