import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/ToDoListTWA/', // Префикс для GitHub Pages
    plugins: [react()],
    define: {
      'import.meta.env.VITE_BOT_TOKEN': JSON.stringify(env.VITE_BOT_TOKEN),
    },
  };
});