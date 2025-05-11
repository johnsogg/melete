import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "demo",
  server: {
    open: true,
  },
  // Critical for resolving your local library
  resolve: {
    alias: {
      "@johnsogg/melete": resolve(__dirname, "./lib/index.ts"),
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "melete",
      fileName: (format) => `melete.${format}.js`,
      formats: ["es"],
    },
    // Generate sourcemaps for easier debugging
    sourcemap: true,
    // Exclude peer dependencies from the bundle
  },
});
