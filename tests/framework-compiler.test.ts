import { describe, expect, it } from "vitest";
import { compileFramework } from "../src/services/frameworkCompiler";

describe("bounded framework transpilation", () => {
  it("builds local React JSX/TSX imports and styles", () => {
    const output = compileFramework(
      {
        "src/main.tsx":
          'import {createRoot} from "react-dom/client"; import App from "./App"; import "./style.css"; createRoot(document.getElementById("root")!).render(<App />);',
        "src/App.tsx":
          "export default function App(){ return <h1>Real React</h1> }",
        "src/style.css": "h1 { color: red; }",
      },
      "react",
    );
    expect(output.diagnostics).toEqual([]);
    expect(output.modules["src/App.tsx"]).toContain("jsx");
    expect(output.imports["src/main.tsx"]["./App"]).toBe("src/App.tsx");
    expect(output.styles).toContain("color: red");
  });
  it("inlines Angular component templates/styles without network fetches", () => {
    const output = compileFramework(
      {
        "src/main.ts":
          'import {Component} from "@angular/core"; @Component({selector:"app-root", templateUrl:"./view.html", styleUrls:["./style.css"]}) class App {}',
        "src/view.html": "<h1>{{ 1 + 2 }}</h1>",
        "src/style.css": "h1 { color: red; }",
      },
      "angular",
    );
    expect(output.diagnostics).toEqual([]);
    expect(output.modules["src/main.ts"]).toContain("{{ 1 + 2 }}");
    expect(output.modules["src/main.ts"]).not.toContain("templateUrl");
  });
  it("rejects unknown packages, dynamic imports, traversal and missing resources", () => {
    for (const source of [
      'import x from "unapproved"; console.log(x)',
      'import("react")',
      'require("react")',
      'import "../../outside";',
    ])
      expect(
        compileFramework({ "src/main.jsx": source }, "react").diagnostics
          .length,
      ).toBeGreaterThan(0);
    expect(
      compileFramework(
        {
          "src/main.ts":
            'import {Component} from "@angular/core"; @Component({templateUrl:"./missing.html"}) class App {}',
        },
        "angular",
      ).diagnostics.join(),
    ).toContain("missing");
  });
  it("rejects syntax errors and oversize inputs; handles circular local imports", () => {
    expect(
      compileFramework({ "src/main.jsx": "function (" }, "react").diagnostics
        .length,
    ).toBeGreaterThan(0);
    expect(
      compileFramework({ "src/main.jsx": "x".repeat(512001) }, "react")
        .diagnostics.length,
    ).toBeGreaterThan(0);
    const output = compileFramework(
      {
        "src/main.jsx": 'import "./other";',
        "src/other.js": 'import "./main.jsx";',
      },
      "react",
    );
    expect(output.diagnostics).toEqual([]);
    expect(Object.keys(output.modules)).toHaveLength(2);
  });
});
