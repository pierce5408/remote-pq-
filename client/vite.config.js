import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set VITE_BASE to your GitHub repo name when deploying, e.g. /romeo/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
});
