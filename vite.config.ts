import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './lib'),
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'Melete',
      fileName: (format) => `melete.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    sourcemap: true,
    outDir: resolve(__dirname, 'dist'),
  },
});