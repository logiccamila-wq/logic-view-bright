import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // deploy no root do domínio
  build: {
    target: 'es2017',
  },
});
