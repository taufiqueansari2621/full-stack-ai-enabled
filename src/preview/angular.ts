import "@angular/compiler";
import * as core from "@angular/core";
import * as common from "@angular/common";
import * as browser from "@angular/platform-browser";
import * as rxjs from "rxjs";
import { execute } from "./execute";
import type { PreviewBuild } from "../domain/frameworkPreview";
export function boot(build: PreviewBuild) {
  execute(build, {
    "@angular/core": core,
    "@angular/common": common,
    "@angular/platform-browser": browser,
    rxjs,
  });
}
