import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      // Кастомная обработка для import.meta
      astTransformers: {
        before: [
          {
            path: 'node_modules/ts-jest-mock-import-meta',
            options: {
              meta: { env: { VITE_BOT_TOKEN: 'test-token' } },
            },
          },
        ],
      },
    }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@?)/)'], // Разрешаем трансформацию для некоторых модулей
};

export default config;