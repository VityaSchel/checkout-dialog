import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
// import EsLint from 'vite-plugin-linter'
import tsConfigPaths from 'vite-tsconfig-paths'
// const { EsLinter, linterPlugin } = EsLint
// import * as packageJson from './package.json'
// https://vitejs.dev/config/
export default defineConfig((configEnv) => ({
  plugins: [
    // react(),
    tsConfigPaths(),
    // linterPlugin({
    //   include: ['./src}/**/*.{ts,tsx}'],
    //   linters: [new EsLinter({ configEnv })],
    // }),
    dts({
      include: ['src/'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve('src/index.ts'),
      name: 'ReactViteLibrary',
      formats: ['es', 'umd'],
      fileName: (format) => `checkout.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react', 'react-dom',
        '@emotion/react',
        '@emotion/styled',
        // ...Object.keys(packageJson.peerDependencies)
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'reactdom'
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/shared/styles/variables.scss";'
      }
    }
  }
}))