/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { safePostsPlugin } from './src/lib/posts/postsPlugin'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), safePostsPlugin({ postsDir: resolve(__dirname, 'posts') })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.sandcastle/**'],
  },
})
