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
      { name: "adds positive numbers", input: [2, 3, 4], expected: 9 },
      { name: "supports negative numbers", input: [-2, 5, -1], expected: 2 },
      { name: "handles an empty array", input: [], expected: 0 },
    ];
    const results = tests.map(({ name, input, expected }) => {
      try {
        if (typeof sum !== "function")
          throw new Error(
            "Define a function named sum before running the tests.",
          );
        const actual = sum([...input]);
        return {
          name,
          passed: actual === expected,
          input: JSON.stringify(input),
          expected: String(expected),
          actual: (format(actual) ?? String(actual)).slice(0, 2000),
          detail: null,
        };
      } catch (error) {
        return {
          name,
          passed: false,
          input: JSON.stringify(input),
          expected: String(expected),
          actual: "No result",
          detail: String(error).slice(0, 2000),
        };
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
      error: String(error).slice(0, 2000),
      executionMs: performance.now() - started,
    });
  }
};
