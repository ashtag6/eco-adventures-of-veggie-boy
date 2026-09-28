import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build`        -> dist/ with relative paths (itch.io, GitHub Pages, Netlify)
// `npm run build:single` -> dist-single/index.html, everything inlined (quick sharing, Claude artifact)
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: mode === "single" ? [viteSingleFile()] : [],
  build: {
    outDir: mode === "single" ? "dist-single" : "dist",
    emptyOutDir: true,
  },
}));
