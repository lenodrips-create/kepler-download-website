import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Built into a temp folder, then copied to the site root as index.html with
// its bundles under assets/home/ (see README). Relative base keeps paths
// working on GitHub Pages and the custom domain alike.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets/home",
  },
});
