import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FormStore',
      fileName: (format) => `formstore.${format}.js`,
      formats: ['es', 'umd'],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    target: 'es2020',
    minify: 'terser',
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '*.config.js',
        '*.config.ts',
      ],
    },
  },
});
