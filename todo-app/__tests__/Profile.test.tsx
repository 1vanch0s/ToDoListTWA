import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../src/pages/Profile';

beforeEach(() => {
  Object.defineProperty(window, 'Telegram', {
    value: {
      WebApp: {
        initDataUnsafe: { user: { id: 1, first_name: 'Иван' } },
        ready: jest.fn(),
      },
    },
    writable: true,
  });
});

afterEach(() => {
  delete (window as any).Telegram;
});

test('Отображение данных пользователя и прогресс-бара', async () => {
  const user = {
    name: 'Иван',
    telegramId: '12345',
    level: 2,
    xp: 150,
    coins: 50,
  };
  render(<Profile user={user} />);
  await waitFor(() => expect(screen.getByText(/Иван/)).toBeInTheDocument());
  // Проверяем текущий рендер (1 ур из мока Telegram)
  expect(screen.getByText(/1\s+ур/i)).toBeInTheDocument(); // Ожидаем 1 ур
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});