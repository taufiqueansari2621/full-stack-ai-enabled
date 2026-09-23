for (const capability of [
  "fetch",
  "WebSocket",
  "EventSource",
  "importScripts",
  "XMLHttpRequest",
]) {
  try {
    Object.defineProperty(self, capability, {
      value: undefined,
      writable: false,
      configurable: false,
    });
  } catch {
    // The isolated runner also has a hard termination deadline in the parent.
  }
}

self.onmessage = (event) => {
  const started = performance.now();
  const logs = [];
  const format = (value) => {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };
  console.log = (...values) => {
    if (logs.length < 80)
      logs.push(values.map(format).join(" ").slice(0, 2000));
  };
  try {
    const getSum = new Function(
      `${event.data.code}\n; return typeof sum === "function" ? sum : null;`,
    );
    const sum = getSum();
    const tests = [
      ["adds positive numbers", () => sum && sum([2, 3, 4]) === 9],
      ["supports negative numbers", () => sum && sum([-2, 5, -1]) === 2],
      ["handles an empty array", () => sum && sum([]) === 0],
    ];
    const results = tests.map(([name, test]) => {
      try {
        return { name, passed: Boolean(test()) };
      } catch (error) {
        return { name, passed: false, detail: String(error) };
      }
    });
    self.postMessage({
      logs,
      results,
      error: null,
      executionMs: performance.now() - started,
    });
  } catch (error) {
    self.postMessage({
      logs,
      results: [],
      error: String(error),
      executionMs: performance.now() - started,
    });
  }
};
