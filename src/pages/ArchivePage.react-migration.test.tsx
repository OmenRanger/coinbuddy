import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as useCoinsModule from '../lib/useCoins';
import type { Coin } from '../lib/types';
import { ArchivePage } from './ArchivePage';
import { createCsvExport, escapeCsvCell, createJsonExport } from '../features/archive/exporters';

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

describe('Archive & Reports (React migration)', () => {
  it('renders empty state', () => {
    vi.spyOn(useCoinsModule, 'useCoins').mockReturnValue({
      coins: [],
      error: null,
      refresh: vi.fn(async () => undefined),
    });

    render(<ArchivePage />);

    expect(screen.getByRole('heading', { name: /archive & reports/i })).toBeInTheDocument();
    expect(screen.getByText(/no records yet/i)).toBeInTheDocument();
  });

  it('renders summary and printable report when coins exist', () => {
    const coins: Coin[] = [
      makeCoin({
        id: 'a',
        name: 'Has Photos',
        obverseImageUrl: 'data:image/png;base64,AAA',
        reverseImageUrl: 'data:image/png;base64,BBB',
        favorite: true,
        estimatedValueLow: 10,
        estimatedValueMid: 20,
        estimatedValueHigh: 30,
      }),
      makeCoin({
        id: 'b',
        name: 'Missing Back',
        obverseImageUrl: 'data:image/png;base64,CCC',
        needsReview: true,
      }),
    ];

    vi.spyOn(useCoinsModule, 'useCoins').mockReturnValue({
      coins,
      error: null,
      refresh: vi.fn(async () => undefined),
    });

    render(<ArchivePage />);

    // Export actions
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print report/i })).toBeInTheDocument();

    // Printable report includes coin names
    expect(screen.getByText(/coinbuddy collection report/i)).toBeInTheDocument();
    expect(screen.getByText('Has Photos')).toBeInTheDocument();
    expect(screen.getByText('Missing Back')).toBeInTheDocument();
  });

  it('CSV export escapes correctly and does not include image data URLs', () => {
    const coins: Coin[] = [
      makeCoin({
        id: 'a',
        name: 'Comma, Quote " and newline\ncoin',
        obverseImageUrl: 'data:image/png;base64,AAA',
        reverseImageUrl: undefined,
        notes: 'Line1\nLine2',
      }),
    ];

    const csv = createCsvExport(coins);

    expect(csv).not.toMatch(/data:image\//);
    expect(csv).toMatch(/Has Front Photo/);
    expect(csv).toMatch(/Has Back Photo/);

    // basic escaping behavior
    expect(escapeCsvCell('a"b')).toBe('"a""b"');
    expect(csv).toMatch(/"Comma, Quote "" and newline/);
  });

  it('JSON export has required shape', () => {
    const coins: Coin[] = [makeCoin({ id: 'a', name: 'Test Coin' })];
    const json = createJsonExport(coins);

    expect(json.appName).toBe('CoinBuddy');
    expect(json.exportType).toBe('collection-archive');
    expect(json.coinCount).toBe(1);
    expect(json.coins[0].name).toBe('Test Coin');
  });
});
