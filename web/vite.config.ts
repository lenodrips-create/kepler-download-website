import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Builds React "islands" that the static pages in the repo root load.
// Output goes to ../assets/react with stable names so the HTML can link them
// directly — no build step is needed to serve the site.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "../assets/react"),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "src/main.tsx"),
      output: {
        entryFileNames: "islands.js",
        assetFileNames: "islands[extname]",
        chunkFileNames: "[name].js",
      },
    },
  },
});
