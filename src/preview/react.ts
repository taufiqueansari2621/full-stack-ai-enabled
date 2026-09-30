import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as JSX from "react/jsx-runtime";
import { execute } from "./execute";
import type { PreviewBuild } from "../domain/frameworkPreview";
export function boot(build: PreviewBuild) {
  execute(build, {
    react: React,
    "react-dom/client": ReactDOM,
    "react/jsx-runtime": JSX,
  });
}
