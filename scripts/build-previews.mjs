import { build } from "vite";
for (const framework of ["react", "angular"]) {
  await build({
    configFile: false,
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      outDir: "dist/preview",
      emptyOutDir: false,
      copyPublicDir: false,
      lib: {
        entry: `src/preview/${framework}.ts`,
        name: "ForgePreview",
        formats: ["iife"],
        fileName: () => `${framework}.js`,
      },
    },
  });
}
