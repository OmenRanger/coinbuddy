import { Link } from 'react-router-dom';
import { useCoins } from '../lib/useCoins';
import { Card } from '../ui/Card';

export function CollectionPage() {
  const { coins, error, refresh } = useCoins();

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">My Collection</h1>
            <p className="mt-2 text-base text-ledger-muted">
              Tap a coin to view details. Add more coins anytime.
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
      </Card>

      {error ? (
        <Card>
          <p className="text-ledger-oxblood">{error}</p>
        </Card>
      ) : null}

      {coins === null ? (
        <Card>
          <p className="text-base">Loading your collection…</p>
        </Card>
      ) : coins.length === 0 ? (
        <Card>
          <h2 className="font-serif text-2xl font-bold">No coins yet</h2>
          <p className="mt-2 text-base text-ledger-muted">
            Start by adding a coin. You can always edit later.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/add"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
            >
              Add Coin Manually
            </Link>
            <Link
              to="/scan"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
            >
              Scan Coin
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {coins.map((coin) => (
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
