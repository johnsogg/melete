import { resolve } from "path";

import { defineConfig } from "vite";

export default defineConfig({
    root: "demo",
    server: {
        open: true,
    },
    resolve: {
        alias: {
            "@johnsogg/melete": resolve(__dirname, "./lib/index.ts"),
            "~": resolve(__dirname, "./lib"),
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
        sourcemap: true,
    },
});
