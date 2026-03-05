import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // manualChunks removed to avoid circular dependency issues
      }
    }
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
