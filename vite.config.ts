import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // deploy at domain root
  build: {
    target: 'es2017',
  },
});
