import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders App component', () => {
  render(<App />);
  expect(screen.getByText(/Задачи/)).toBeInTheDocument();
});