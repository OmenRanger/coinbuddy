import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from './ui/AppLayout';
import { HomePage } from './pages/HomePage';
import { AddCoinPage } from './pages/AddCoinPage';
import { CollectionPage } from './pages/CollectionPage';
import { CoinDetailPage } from './pages/CoinDetailPage';
import { ToastProvider } from './ui/Toast';

function renderFlow(initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'add', element: <AddCoinPage /> },
          { path: 'collection', element: <CollectionPage /> },
          { path: 'collection/:coinId', element: <CoinDetailPage /> },
        ],
      },
    ],
    { initialEntries },
  );

  return render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );
}

describe('CoinBuddy flow', () => {
  it('allows adding a coin and viewing it in detail', async () => {
    const user = userEvent.setup();
    renderFlow(['/add']);

    await user.type(screen.getByLabelText(/coin name/i), 'Test Lincoln Penny');
    await user.click(screen.getByRole('button', { name: /add coin to my collection/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /test lincoln penny/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/coin record/i)).toBeInTheDocument();
  });
});
