import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: '.', // Указываем текущую папку (todo-app) как корень
    build: {
      outDir: '../dist', // Сохраняем собранные файлы в корень /ToDoListTWA/dist
      assetsDir: 'assets', // Папка для CSS/JS
    },
    base: '/', // Корневой путь для Vercel
    plugins: [react()],
    define: {
      'import.meta.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || 'https://todolisttwa.onrender.com'),
    },
  };
});