import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/ToDoListTWA/',
    define: {
      'import.meta.env.VITE_BOT_TOKEN': JSON.stringify(env.VITE_BOT_TOKEN),
    },
  };
});