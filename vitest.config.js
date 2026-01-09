import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {

    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['e2e/**'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js', // if you have a setup file
  },
});
