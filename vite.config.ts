import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        entryFileNames: "assets/format-tool-[name]-[hash].js",
        chunkFileNames: "assets/format-tool-[name]-[hash].js",
      },
    },
  },
});
