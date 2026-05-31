import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CollectionPage } from './CollectionPage';
import type { Coin } from '../lib/types';
import * as useCoinsModule from '../lib/useCoins';
import { AppLayout } from '../ui/AppLayout';

function makeCoin(partial: Partial<Coin>): Coin {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? 'c1',
    name: partial.name ?? 'Coin',
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    ...partial,
  };
}

function renderCollection(coins: Coin[]) {
  vi.spyOn(useCoinsModule, 'useCoins').mockReturnValue({
    coins,
    error: null,
    refresh: vi.fn(async () => undefined),
  });

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ path: 'collection', element: <CollectionPage /> }],
      },
    ],
    { initialEntries: ['/collection'] },
  );

  return render(<RouterProvider router={router} />);
}

describe('CollectionPage search/sort/filter', () => {
  it('search filters by multiple fields and reset restores', async () => {
    const user = userEvent.setup();
    const coins = [
      makeCoin({
        id: 'a',
        name: 'Lincoln Cent',
        year: '1909',
        country: 'USA',
        denomination: 'Penny',
        notes: 'Wheat reverse',
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      }),
      makeCoin({
        id: 'b',
        name: 'Buffalo Nickel',
        year: '1937',
        country: 'USA',
        denomination: 'Nickel',
        mintMark: 'D',
        createdAt: '2021-01-01T00:00:00.000Z',
        updatedAt: '2021-01-01T00:00:00.000Z',
      }),
    ];

    renderCollection(coins);

    // Both coins visible initially
    expect(screen.getByText('Lincoln Cent')).toBeInTheDocument();
    expect(screen.getByText('Buffalo Nickel')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/find a coin/i), '1909');
    expect(screen.getByText('Lincoln Cent')).toBeInTheDocument();
    expect(screen.queryByText('Buffalo Nickel')).toBeNull();

    await user.click(screen.getByRole('button', { name: /^reset$/i }));
    expect(screen.getByText('Lincoln Cent')).toBeInTheDocument();
    expect(screen.getByText('Buffalo Nickel')).toBeInTheDocument();
  });

  it('sort by year orders coins', async () => {
    const user = userEvent.setup();
    const coins = [
      makeCoin({ id: 'a', name: 'Coin 1909', year: '1909', createdAt: '2020-01-01T00:00:00.000Z' }),
      makeCoin({ id: 'b', name: 'Coin 2001', year: '2001', createdAt: '2021-01-01T00:00:00.000Z' }),
    ];

    renderCollection(coins);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'year');

    const names = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent ?? '');
    expect(names[0]).toMatch(/coin 1909/i);
    expect(names[1]).toMatch(/coin 2001/i);
  });

  it('filter missing photos shows only coins without both images', async () => {
    const user = userEvent.setup();
    const coins = [
      makeCoin({ id: 'a', name: 'Has both', obverseImageUrl: 'x', reverseImageUrl: 'y' }),
      makeCoin({ id: 'b', name: 'Missing reverse', obverseImageUrl: 'x' }),
    ];

    renderCollection(coins);

    await user.click(screen.getByRole('button', { name: /missing photos/i }));

    expect(screen.queryByText('Has both')).toBeNull();
    expect(screen.getByText('Missing reverse')).toBeInTheDocument();
  });

  it('shows helpful empty state when no coins match', async () => {
    const user = userEvent.setup();
    const coins = [makeCoin({ id: 'a', name: 'Morgan Dollar', country: 'USA' })];

    renderCollection(coins);

    await user.type(screen.getByLabelText(/find a coin/i), 'zzzzz');

    expect(await screen.findByRole('heading', { name: /no matches/i })).toBeInTheDocument();
    expect(screen.getByText(/no coins match this search/i)).toBeInTheDocument();
  });
});
