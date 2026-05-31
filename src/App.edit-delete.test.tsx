import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from './ui/AppLayout';
import { AddCoinPage } from './pages/AddCoinPage';
import { CoinDetailPage } from './pages/CoinDetailPage';
import { CollectionPage } from './pages/CollectionPage';
import { EditCoinPage } from './pages/EditCoinPage';
import { ToastProvider } from './ui/Toast';

function renderRoutes(initialEntries: string[] = ['/add']) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { path: 'add', element: <AddCoinPage /> },
          { path: 'collection', element: <CollectionPage /> },
          { path: 'collection/:coinId', element: <CoinDetailPage /> },
          { path: 'collection/:coinId/edit', element: <EditCoinPage /> },
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

describe('CoinBuddy edit/delete', () => {
  it('allows editing a coin and seeing the updated name', async () => {
    const user = userEvent.setup();
    renderRoutes(['/add']);

    await user.type(screen.getByLabelText(/coin name/i), 'Original Coin');
    await user.click(screen.getByRole('button', { name: /add coin to my collection/i }));

    const heading = await screen.findByRole('heading', { name: /original coin/i });
    expect(heading).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /edit coin details/i }));

    const nameField = await screen.findByLabelText(/coin name/i);
    await user.clear(nameField);
    await user.type(nameField, 'Edited Coin Name');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edited coin name/i })).toBeInTheDocument();
    });
  });

  it('allows deleting a coin after confirmation', async () => {
    const user = userEvent.setup();
    renderRoutes(['/add']);

    await user.type(screen.getByLabelText(/coin name/i), 'Delete Me Coin');
    await user.click(screen.getByRole('button', { name: /add coin to my collection/i }));

    await screen.findByRole('heading', { name: /delete me coin/i });

    await user.click(screen.getByRole('button', { name: /delete coin/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete/i }));

    // After delete we navigate to /collection, which isn't in this mini router.
    // We assert the delete toast appears among any toasts.
    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts.some((t) => /coin deleted/i.test(t.textContent || ''))).toBe(true);
    });
  });
});
