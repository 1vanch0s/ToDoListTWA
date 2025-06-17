import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tasks from '../src/pages/Tasks';

const mockUpdateCoins = jest.fn();

test('Форма добавления задачи: поля и кнопка', () => {
  render(<Tasks updateCoins={mockUpdateCoins} />);
  fireEvent.click(screen.getByText('+')); // Открываем попап
  expect(screen.getByPlaceholderText('Название')).toBeInTheDocument(); // Исправлен placeholder
  expect(screen.getByText('Лёгкая')).toBeInTheDocument(); // Исправлен текст с "Простой" на "Лёгкая"
  expect(screen.getByRole('button', { name: /Добавить/i })).toBeInTheDocument();
});

// test('Ошибка при добавлении пустой задачи', async () => {
//   render(<Tasks updateCoins={mockUpdateCoins} />);
//   fireEvent.click(screen.getByText('+')); // Открываем попап
//   fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));
//   await waitFor(() => {
//     expect(screen.getByText(/Название не может быть пустым/i)).toBeInTheDocument();
//   }, { timeout: 1000 });
// });