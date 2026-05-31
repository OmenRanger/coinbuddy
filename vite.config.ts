import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Note: Vitest config lives in vitest.config.ts to keep Vite's TS types happy.
export default defineConfig({
  plugins: [react()],
});
