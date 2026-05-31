import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Coin } from '../lib/types';
import { getCoin } from '../lib/db';
import { Card } from '../ui/Card';

export function CoinDetailPage() {
  const { coinId } = useParams();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const record = coinId ? await getCoin(coinId) : undefined;
        if (!cancelled) setCoin(record ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [coinId]);

  if (loading) {
    return (
      <Card>
        <h1 className="font-serif text-3xl font-bold">Coin Detail</h1>
        <p className="mt-2 text-base">Loading…</p>
      </Card>
    );
  }

  if (!coin) {
    return (
      <Card>
        <h1 className="font-serif text-3xl font-bold">Coin not found</h1>
        <p className="mt-2 text-base text-ledger-muted">
          This coin may have been deleted or not saved correctly.
        </p>
        <div className="mt-4">
          <Link
            to="/collection"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
          >
            Back to My Collection
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ledger-oxblood">
              Coin record
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-ledger-ink">{coin.name}</h1>
            <p className="mt-1 text-base text-ledger-muted">
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

      <Card>
        <h2 className="font-serif text-2xl font-bold">Details</h2>
        <dl className="mt-4 grid gap-3 text-base">
          <Row label="Year" value={coin.year} />
          <Row label="Country" value={coin.country} />
          <Row label="Denomination" value={coin.denomination} />
          <Row label="Mint mark" value={coin.mintMark} />
          <Row label="Condition" value={coin.condition} />
          <Row label="Storage" value={coin.storageLocation} />
          <Row label="Notes" value={coin.notes} />
        </dl>
      </Card>

      <Card>
        <p className="text-sm text-ledger-muted">
          Editing, photos, and value estimation come next. For now this confirms the core save-and-view flow.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-xl bg-ledger-paper px-3 py-2">
      <dt className="col-span-1 text-sm font-semibold text-ledger-muted">{label}</dt>
      <dd className="col-span-2 text-sm text-ledger-ink">{value || 'Not recorded'}</dd>
    </div>
  );
}
