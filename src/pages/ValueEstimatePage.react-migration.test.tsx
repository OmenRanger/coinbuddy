import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as useCoinsModule from '../lib/useCoins';
import type { Coin } from '../lib/types';
import { ValueEstimatePage } from './ValueEstimatePage';
import { MemoryRouter } from 'react-router-dom';

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

describe('ValueEstimatePage (React migration)', () => {
  it('renders empty state', () => {
    vi.spyOn(useCoinsModule, 'useCoins').mockReturnValue({
      coins: [],
      error: null,
      refresh: vi.fn(async () => undefined),
    });

    render(
      <MemoryRouter>
        <ValueEstimatePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /value estimate/i })).toBeInTheDocument();
    expect(screen.getByText(/no coins yet/i)).toBeInTheDocument();
  });

  it('shows coins needing sale examples section', () => {
    const coins: Coin[] = [
      makeCoin({ id: 'a', name: 'No examples', valueSources: [] }),
      makeCoin({ id: 'b', name: 'Has examples', valueSources: [{ id: 's1', sourceName: 'eBay', observedPrice: 12 }] }),
    ];

    vi.spyOn(useCoinsModule, 'useCoins').mockReturnValue({
      coins,
      error: null,
      refresh: vi.fn(async () => undefined),
    });

    render(
      <MemoryRouter>
        <ValueEstimatePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/coins needing sale examples/i)).toBeInTheDocument();
    expect(screen.getByText('No examples')).toBeInTheDocument();
  });
});
