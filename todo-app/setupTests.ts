import '@testing-library/jest-dom';
Object.defineProperty(globalThis, 'import.meta', {
  value: { env: { VITE_BOT_TOKEN: 'test-token' } },
  configurable: true,
});
if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}
// Полифил для fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({}),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: jest.fn().mockResolvedValue(new Blob()),
    formData: jest.fn().mockResolvedValue(new FormData()),
    text: jest.fn().mockResolvedValue(''),
  } as unknown as Response)
);
// Мок Telegram
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initDataUnsafe: { user: { id: 1, first_name: 'Test' } },
      ready: jest.fn(),
    },
  },
  writable: true,
});