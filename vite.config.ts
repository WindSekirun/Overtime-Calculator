/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import istanbul from 'vite-plugin-istanbul'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true,
    }),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/', 'dist/'],
      extension: ['.js', '.ts', '.vue'],
      requireEnv: true, // VITE_COVERAGE=true 일 때만 활성화
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true, // 커버리지 정확도를 위해 소스맵 활성화
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['json'],
      reportsDirectory: '.nyc_output', // Output raw json to .nyc_output
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts', 'src/plugins/**', '**/*.d.ts', 'tests/**'],
    },
  },
})
