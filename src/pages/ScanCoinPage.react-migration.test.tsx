import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from '../ui/AppLayout';
import { ScanCoinPage } from './ScanCoinPage';
import { CollectionPage } from './CollectionPage';
import { CoinDetailPage } from './CoinDetailPage';
import { ToastProvider } from '../ui/Toast';

function renderFlow(initialEntries: string[] = ['/scan']) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { path: 'scan', element: <ScanCoinPage /> },
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

describe('ScanCoinPage (React migration)', () => {
  it('renders the scanner page', () => {
    renderFlow();
    expect(screen.getByRole('heading', { name: /scan or add coin photos/i })).toBeInTheDocument();
  });

  it('allows attaching front/back images, previews appear, and saving persists images', async () => {
    const user = userEvent.setup();
    renderFlow();

    const frontInput = document.querySelector('input[name="obverse"]') as HTMLInputElement;
    const backInput = document.querySelector('input[name="reverse"]') as HTMLInputElement;
    expect(frontInput).toBeTruthy();
    expect(backInput).toBeTruthy();

    const frontFile = new File(['front'], 'front.png', { type: 'image/png' });
    const backFile = new File(['back'], 'back.png', { type: 'image/png' });

    await user.upload(frontInput, frontFile);
    await user.upload(backInput, backFile);

    // preview images
    expect(await screen.findByRole('img', { name: /front of coin/i })).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: /back of coin/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/coin name/i), 'Scanner Test Coin');

    await user.click(screen.getByRole('button', { name: /save to my collection/i }));

    // coin detail should show the images
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /scanner test coin/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('img', { name: /front of coin/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /back of coin/i })).toBeInTheDocument();
  });

  it('can remove an image before saving', async () => {
    const user = userEvent.setup();
    renderFlow();

    const frontInput = document.querySelector('input[name="obverse"]') as HTMLInputElement;
    const frontFile = new File(['front'], 'front.png', { type: 'image/png' });
    await user.upload(frontInput, frontFile);

    expect(await screen.findByRole('img', { name: /front of coin/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: /front of coin/i })).toBeNull();
    });
  });
});
