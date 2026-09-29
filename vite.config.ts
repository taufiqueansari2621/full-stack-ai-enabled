import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        entryFileNames: (chunk) =>
          chunk.name.startsWith("typescript")
            ? "assets/ts-tool-[name]-[hash].js"
            : chunk.name.startsWith("sql")
              ? "assets/sql-tool-[name]-[hash].js"
              : "assets/format-tool-[name]-[hash].js",
        chunkFileNames: "assets/format-tool-[name]-[hash].js",
      },
    },
  },
});
