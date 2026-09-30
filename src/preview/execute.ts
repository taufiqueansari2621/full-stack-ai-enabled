import type { PreviewBuild } from "../domain/frameworkPreview";

export function execute(
  build: PreviewBuild,
  packages: Record<string, unknown>,
) {
  const cache: Record<string, { exports: unknown }> = Object.create(null);
  const load = (path: string): unknown => {
    if (Object.hasOwn(packages, path)) return packages[path];
    if (Object.hasOwn(cache, path)) return cache[path].exports;
    if (!Object.hasOwn(build.modules, path))
      throw new Error(`Module not available: ${path}`);
    const module = { exports: {} };
    cache[path] = module;
    const require = (name: string) => {
      const imports = build.imports[path];
      if (!imports || !Object.hasOwn(imports, name))
        throw new Error(`Import not available: ${name}`);
      return load(imports[name]);
    };
    // This module is bundled only into the opaque preview iframe, never the app.
    new Function("require", "module", "exports", build.modules[path])(
      require,
      module,
      module.exports,
    );
    return module.exports;
  };
  const style = document.createElement("style");
  style.textContent = build.styles;
  document.head.append(style);
  load(build.entry);
}
