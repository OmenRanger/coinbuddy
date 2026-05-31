import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ToastProvider } from './ui/Toast';

import { AddCoinPage } from './pages/AddCoinPage';
import { CoinDetailPage } from './pages/CoinDetailPage';
import { CollectionPage } from './pages/CollectionPage';

function renderFlow() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        ),
        children: [
          { path: 'add', element: <AddCoinPage /> },
          { path: 'collection', element: <CollectionPage /> },
          { path: 'collection/:coinId', element: <CoinDetailPage /> },
        ],
      },
    ],
    { initialEntries: ['/add'] },
  );

  render(<RouterProvider router={router} />);
}

describe('CoinBuddy valuation flow', () => {
  it('can add a sale example and see estimate range update on coin detail', async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.type(screen.getByLabelText(/coin name/i), 'Valuation Test Coin');
    await user.click(screen.getByRole('button', { name: /add coin to my collection/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /valuation test coin/i })).toBeInTheDocument();
    });

    // Open editor and add a comp
    await user.click(screen.getByRole('button', { name: /add sale example/i }));
    await user.type(screen.getByLabelText(/where did you see it\?/i), 'eBay sold listing');
    await user.type(screen.getByLabelText(/observed price/i), '12');
    await user.click(screen.getByRole('button', { name: /save example/i }));

    await waitFor(() => {
      const statuses = screen.getAllByRole('status').map((n) => n.textContent ?? '');
      expect(statuses.some((t) => /sale examples saved\./i.test(t))).toBe(true);
    });

    // One example -> low/mid/high all equal
    expect(screen.getByText(/estimated market range/i)).toBeInTheDocument();
    expect(screen.getByText(/\$12(\.00)?\s*\/\s*\$12(\.00)?\s*\/\s*\$12(\.00)?/)).toBeInTheDocument();
  });
});
