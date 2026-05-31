import type { Coin } from '../../lib/types';

export type CollectionSort =
  | 'recentlyAdded'
  | 'recentlyUpdated'
  | 'year'
  | 'estimatedValue'
  | 'name'
  | 'country'
  | 'denomination';

export type CollectionFilter = {
  favoritesOnly: boolean;
  needsReviewOnly: boolean;
  missingPhotosOnly: boolean;
  country?: string;
  denomination?: string;
  condition?: string;
  storageLocation?: string;
};

export function coinSearchText(coin: Coin): string {
  return [
    coin.name,
    coin.country,
    coin.denomination,
    coin.year,
    coin.mintMark,
    coin.condition,
    coin.storageLocation,
    coin.notes,
    ...(coin.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function matchesSearch(coin: Coin, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return coinSearchText(coin).includes(normalized);
}

export function matchesFilters(coin: Coin, filter: CollectionFilter): boolean {
  if (filter.favoritesOnly && !coin.favorite) return false;
  if (filter.needsReviewOnly && !coin.needsReview) return false;
  if (filter.missingPhotosOnly && (coin.obverseImageUrl && coin.reverseImageUrl)) return false;

  if (filter.country && (coin.country ?? '') !== filter.country) return false;
  if (filter.denomination && (coin.denomination ?? '') !== filter.denomination) return false;
  if (filter.condition && (coin.condition ?? '') !== filter.condition) return false;
  if (filter.storageLocation && (coin.storageLocation ?? '') !== filter.storageLocation) return false;

  return true;
}

export function sortCoins(coins: Coin[], sort: CollectionSort): Coin[] {
  const sorted = [...coins];

  switch (sort) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'year':
      return sorted.sort((a, b) => String(a.year ?? '').localeCompare(String(b.year ?? '')));
    case 'country':
      return sorted.sort((a, b) => String(a.country ?? '').localeCompare(String(b.country ?? '')));
    case 'denomination':
      return sorted.sort((a, b) => String(a.denomination ?? '').localeCompare(String(b.denomination ?? '')));
    case 'estimatedValue':
      return sorted.sort((a, b) => (b.estimatedValueMid ?? 0) - (a.estimatedValueMid ?? 0));
    case 'recentlyUpdated':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case 'recentlyAdded':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export function applyCollectionQuery(input: {
  coins: Coin[];
  query: string;
  sort: CollectionSort;
  filter: CollectionFilter;
}): Coin[] {
  const filtered = input.coins
    .filter((coin) => matchesSearch(coin, input.query))
    .filter((coin) => matchesFilters(coin, input.filter));

  return sortCoins(filtered, input.sort);
}

export function uniqueValues(coins: Coin[], key: keyof Coin): string[] {
  const values = new Set<string>();
  for (const coin of coins) {
    const raw = coin[key];
    if (typeof raw === 'string' && raw.trim()) values.add(raw);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}
