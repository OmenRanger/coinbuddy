import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Coin } from '../lib/types';
import { deleteCoin, getCoin } from '../lib/db';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';

export function CoinDetailPage() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/collection/${coin.id}/edit`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
          >
            Edit coin details
          </Link>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold text-ledger-oxblood"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete coin
          </button>
        </div>
        <p className="mt-4 text-sm text-ledger-muted">
          Tip: delete removes this coin from this device. Export your archive regularly for backup.
        </p>
      </Card>

      {confirmingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-ledger-border bg-ledger-card p-5 shadow-card">
            <h2 className="font-serif text-2xl font-bold">Delete this coin?</h2>
            <p className="mt-2 text-base text-ledger-muted">
              This cant be undone. Your coin record and photos (if any) will be removed from this device.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-ledger-oxblood px-4 text-base font-semibold text-ledger-paper"
                onClick={async () => {
                  if (!coinId) return;
                  await deleteCoin(coinId);
                  toast('Coin deleted.');
                  navigate('/collection');
                }}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
