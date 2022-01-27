const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FormStore',
      fileName: (format) => `formstore.${format}.js`
    },
    rollupOptions: {
      // libs that you don't want bundled in your dist
      // see https://vitejs.dev/guide/build.html#library-mode
      external: [],
      output: {}
    }
  }
})