import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { executeSql } from "../services/sqlEngine";

self.onmessage = async (event: MessageEvent<{ query: string }>) => {
  try {
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    self.postMessage({ result: executeSql(SQL, event.data.query) });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
