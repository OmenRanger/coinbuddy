import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from './ui/AppLayout';
import { HomePage } from './pages/HomePage';

function renderApp() {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: [{ index: true, element: <HomePage /> }],
    },
  ]);

  return render(<RouterProvider router={router} />);
}

describe('CoinBuddy app', () => {
  it('renders the home screen', () => {
    renderApp();

    expect(screen.getByRole('link', { name: /coinbuddy/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /keep every coin easy to find/i })).toBeInTheDocument();
  });
});
