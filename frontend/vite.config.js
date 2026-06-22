import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/AI_Travel_Planner/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});