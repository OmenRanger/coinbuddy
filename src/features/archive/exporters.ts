import type { Coin } from '../../lib/types';
import { computeArchiveSummary } from './summary';

export type CoinBuddyJsonExport = {
  appName: 'CoinBuddy';
  exportType: 'collection-archive';
  schemaVersion: string;
  generatedAt: string;
  coinCount: number;
  summary: {
    totalCoins: number;
    coinsWithPhotos: number;
    coinsMissingPhotos: number;
    needsReviewCount: number;
    favoriteCount: number;
    estimatedValueLowTotal?: number;
    estimatedValueMidTotal?: number;
    estimatedValueHighTotal?: number;
  };
  coins: Coin[];
  notes: string;
};

export function createJsonExport(coins: Coin[]): CoinBuddyJsonExport {
  const summary = computeArchiveSummary(coins);
  return {
    appName: 'CoinBuddy',
    exportType: 'collection-archive',
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    coinCount: coins.length,
    summary,
    coins,
    notes:
      'Exports may include embedded photos as data URLs. Files can be large. CoinBuddy records and value ranges are for personal documentation and research support only, not official appraisals or proof of coverage.',
  };
}

type CsvRow = Record<string, string>;

export function createCsvExport(coins: Coin[]): string {
  const rows: CsvRow[] = coins.map((c) => ({
    Name: c.name ?? '',
    Country: c.country ?? '',
    Denomination: c.denomination ?? '',
    Year: c.year ?? '',
    'Mint Mark': c.mintMark ?? '',
    Condition: c.condition ?? '',
    'Estimated Value Low': numToString(c.estimatedValueLow),
    'Estimated Value Mid': numToString(c.estimatedValueMid),
    'Estimated Value High': numToString(c.estimatedValueHigh),
    'Storage Location': c.storageLocation ?? '',
    Favorite: c.favorite ? 'Yes' : 'No',
    'Needs Review': c.needsReview ? 'Yes' : 'No',
    'Has Front Photo': c.obverseImageUrl ? 'Yes' : 'No',
    'Has Back Photo': c.reverseImageUrl ? 'Yes' : 'No',
    Notes: c.notes ?? '',
    'Created At': c.createdAt ?? '',
    'Updated At': c.updatedAt ?? '',
  }));

  const headers = Object.keys(rows[0] ?? {
    Name: '',
    Country: '',
    Denomination: '',
    Year: '',
    'Mint Mark': '',
    Condition: '',
    'Estimated Value Low': '',
    'Estimated Value Mid': '',
    'Estimated Value High': '',
    'Storage Location': '',
    Favorite: '',
    'Needs Review': '',
    'Has Front Photo': '',
    'Has Back Photo': '',
    Notes: '',
    'Created At': '',
    'Updated At': '',
  });

  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => headers.map((h) => escapeCsvCell(r[h] ?? '')).join(',')),
  ];

  return lines.join('\n');
}

function numToString(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return String(value);
}

export function escapeCsvCell(value: string): string {
  // Ensure commas, quotes, and newlines are safe.
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
