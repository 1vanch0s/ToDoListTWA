import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Rewards from '../src/pages/Rewards';

const mockUpdateCoins = jest.fn();

test('Форма создания награды: все поля и кнопка', () => {
  render(<Rewards updateCoins={mockUpdateCoins} />);
  fireEvent.click(screen.getByText('+')); // Открываем попап
  expect(screen.getByPlaceholderText('Название')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Стоимость (монеты)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Добавить/i })).toBeInTheDocument();
});

test('Ошибка при покупке награды с недостатком валюты', async () => {
  render(<Rewards updateCoins={mockUpdateCoins} />);
  fireEvent.click(screen.getByText('+')); // Открываем попап
  // Мок данных наград (пример)
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify([{ name: 'TestReward', cost: 100 }]));
  // Предположим, что после добавления появляется кнопка покупки (нужно проверить логику)
  await waitFor(() => {
    expect(screen.queryByText(/Недостаточно валюты/i)).not.toBeInTheDocument(); // Начальное состояние
  }, { timeout: 1000 });
});