import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
const resolveBasePath = (appUrl?: string) => {
  if (!appUrl) {
    return '/';
  }

  let basePath = appUrl;
  try {
    basePath = new URL(appUrl).pathname;
  } catch {
    basePath = appUrl;
  }

  if (!basePath.startsWith('/')) {
    basePath = `/${basePath}`;
  }

  if (basePath === '/') {
    return basePath;
  }

  return basePath.endsWith('/') ? basePath : `${basePath}/`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveBasePath(env.VITE_APP_URL);

  return {
    base,
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
  };
})
