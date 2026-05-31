import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  applyCollectionQuery,
  type CollectionFilter,
  type CollectionSort,
  uniqueValues,
} from '../features/collection/collectionQuery';
import { useCoins } from '../lib/useCoins';
import { Card } from '../ui/Card';

const defaultFilter: CollectionFilter = {
  favoritesOnly: false,
  needsReviewOnly: false,
  missingPhotosOnly: false,
  country: undefined,
  denomination: undefined,
  condition: undefined,
  storageLocation: undefined,
};

const sortOptions: { value: CollectionSort; label: string }[] = [
  { value: 'recentlyAdded', label: 'Recently added' },
  { value: 'recentlyUpdated', label: 'Recently updated' },
  { value: 'name', label: 'Name (A → Z)' },
  { value: 'year', label: 'Year' },
  { value: 'estimatedValue', label: 'Estimated value (high → low)' },
  { value: 'country', label: 'Country' },
  { value: 'denomination', label: 'Denomination' },
];

export function CollectionPage() {
  const { coins, error, refresh } = useCoins();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CollectionSort>('recentlyAdded');
  const [filter, setFilter] = useState<CollectionFilter>(defaultFilter);

  const availableCountries = useMemo(() => (coins ? uniqueValues(coins, 'country') : []), [coins]);
  const availableDenoms = useMemo(
    () => (coins ? uniqueValues(coins, 'denomination') : []),
    [coins],
  );
  const availableConditions = useMemo(
    () => (coins ? uniqueValues(coins, 'condition') : []),
    [coins],
  );
  const availableStorage = useMemo(
    () => (coins ? uniqueValues(coins, 'storageLocation') : []),
    [coins],
  );

  const filteredCoins = useMemo(() => {
    if (!coins) return null;
    return applyCollectionQuery({ coins, query, sort, filter });
  }, [coins, query, sort, filter]);

  const hasAnyFilters =
    Boolean(query.trim()) ||
    filter.favoritesOnly ||
    filter.needsReviewOnly ||
    filter.missingPhotosOnly ||
    Boolean(filter.country) ||
    Boolean(filter.denomination) ||
    Boolean(filter.condition) ||
    Boolean(filter.storageLocation) ||
    sort !== 'recentlyAdded';

  function reset() {
    setQuery('');
    setSort('recentlyAdded');
    setFilter(defaultFilter);
  }

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold">My Collection</h1>
              <p className="mt-2 text-base text-ledger-muted">
                Find a coin, then tap it to view details.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl border border-ledger-border bg-ledger-paper px-3 py-2 text-sm font-semibold"
              onClick={refresh}
            >
              Refresh
            </button>
          </div>

          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-semibold">Find a coin</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a name, year, country, mint mark, notes"
                className="h-11 rounded-xl border border-ledger-border bg-ledger-paper px-3 text-base outline-none focus:ring-2 focus:ring-ledger-gold"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-semibold">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as CollectionSort)}
                  className="h-11 rounded-xl border border-ledger-border bg-ledger-paper px-3 text-base"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-1">
                <span className="text-sm font-semibold">Show only</span>
                <div className="flex flex-wrap gap-2">
                  <ToggleChip
                    checked={filter.favoritesOnly}
                    onChange={(checked) => setFilter((f) => ({ ...f, favoritesOnly: checked }))}
                    label="Favorites"
                  />
                  <ToggleChip
                    checked={filter.needsReviewOnly}
                    onChange={(checked) => setFilter((f) => ({ ...f, needsReviewOnly: checked }))}
                    label="Needs review"
                  />
                  <ToggleChip
                    checked={filter.missingPhotosOnly}
                    onChange={(checked) =>
                      setFilter((f) => ({ ...f, missingPhotosOnly: checked }))
                    }
                    label="Missing photos"
                  />
                </div>
              </div>
            </div>

            <details className="rounded-xl border border-ledger-border bg-ledger-paper px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold">More filters</summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <SelectFilter
                  label="Country"
                  value={filter.country ?? ''}
                  options={availableCountries}
                  onChange={(value) => setFilter((f) => ({ ...f, country: value || undefined }))}
                />
                <SelectFilter
                  label="Denomination"
                  value={filter.denomination ?? ''}
                  options={availableDenoms}
                  onChange={(value) =>
                    setFilter((f) => ({ ...f, denomination: value || undefined }))
                  }
                />
                <SelectFilter
                  label="Condition"
                  value={filter.condition ?? ''}
                  options={availableConditions}
                  onChange={(value) => setFilter((f) => ({ ...f, condition: value || undefined }))}
                />
                <SelectFilter
                  label="Storage location"
                  value={filter.storageLocation ?? ''}
                  options={availableStorage}
                  onChange={(value) =>
                    setFilter((f) => ({ ...f, storageLocation: value || undefined }))
                  }
                />
              </div>
            </details>

            {hasAnyFilters ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ledger-muted">
                  Showing {filteredCoins ? filteredCoins.length : 0}{' '}
                  {filteredCoins && filteredCoins.length === 1 ? 'coin' : 'coins'}.
                </p>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-sm font-semibold"
                  onClick={reset}
                >
                  Reset
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <p className="text-ledger-oxblood">{error}</p>
        </Card>
      ) : null}

      {filteredCoins === null ? (
        <Card>
          <p className="text-base">Loading your collection…</p>
        </Card>
      ) : filteredCoins.length === 0 ? (
        <Card>
          <h2 className="font-serif text-2xl font-bold">No matches</h2>
          <p className="mt-2 text-base text-ledger-muted">
            No coins match this search. Try clearing filters.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {hasAnyFilters ? (
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
                onClick={reset}
              >
                Reset
              </button>
            ) : null}
            <Link
              to="/add"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
            >
              Add Coin Manually
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredCoins.map((coin) => (
            <Link key={coin.id} to={`/collection/${coin.id}`} className="block">
              <Card className="hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ledger-ink">{coin.name}</h2>
                    <p className="text-sm text-ledger-muted">
                      {coin.year ? `${coin.year} · ` : ''}
                      {coin.denomination ?? 'Coin'}
                      {coin.country ? ` · ${coin.country}` : ''}
                    </p>
                  </div>
                  {coin.needsReview ? (
                    <span className="rounded-full bg-ledger-oxblood/10 px-3 py-1 text-xs font-semibold text-ledger-oxblood">
                      Needs review
                    </span>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleChip(props: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
        props.checked
          ? 'border-ledger-ink bg-ledger-ink text-white'
          : 'border-ledger-border bg-ledger-paper text-ledger-ink'
      }`}
      onClick={() => props.onChange(!props.checked)}
      aria-pressed={props.checked}
    >
      {props.label}
    </button>
  );
}

function SelectFilter(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-11 rounded-xl border border-ledger-border bg-ledger-paper px-3 text-base"
      >
        <option value="">All</option>
        {props.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
