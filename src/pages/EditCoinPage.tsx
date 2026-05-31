import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCoin } from '../lib/coinModel';
import { getCoin, upsertCoin } from '../lib/db';
import type { Coin } from '../lib/types';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import { CoinForm, coinToFormState, type CoinFormState } from '../features/coins/CoinForm';

export function EditCoinPage() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [coin, setCoin] = useState<Coin | null>(null);
  const [state, setState] = useState<CoinFormState>(() => coinToFormState(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const record = coinId ? await getCoin(coinId) : undefined;
        if (cancelled) return;
        setCoin(record ?? null);
        if (record) {
          setState(
            coinToFormState({
              name: record.name ?? '',
              year: record.year ?? '',
              country: record.country ?? '',
              denomination: record.denomination ?? '',
              mintMark: record.mintMark ?? '',
              condition: record.condition ?? '',
              storageLocation: record.storageLocation ?? '',
              notes: record.notes ?? '',
              needsReview: Boolean(record.needsReview),
            }),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [coinId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coin) return;

    setSaving(true);
    try {
      const updated = createCoin({
        ...coin,
        name: state.name,
        year: state.year || undefined,
        country: state.country || undefined,
        denomination: state.denomination || undefined,
        mintMark: state.mintMark || undefined,
        condition: state.condition || undefined,
        storageLocation: state.storageLocation || undefined,
        notes: state.notes || undefined,
        needsReview: state.needsReview,
        id: coin.id,
        createdAt: coin.createdAt,
      });

      await upsertCoin(updated);
      toast('Saved changes.');
      navigate(`/collection/${coin.id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <h1 className="font-serif text-3xl font-bold">Edit Coin</h1>
        <p className="mt-2 text-base">Loading…</p>
      </Card>
    );
  }

  if (!coin) {
    return (
      <Card>
        <h1 className="font-serif text-3xl font-bold">Coin not found</h1>
        <p className="mt-2 text-base text-ledger-muted">This coin may have been deleted.</p>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
            onClick={() => navigate('/collection')}
          >
            Back to My Collection
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <h1 className="font-serif text-3xl font-bold">Edit Coin</h1>
        <p className="mt-2 text-base text-ledger-muted">Make changes, then save.</p>
      </Card>

      <Card>
        <CoinForm
          state={state}
          setState={setState}
          saving={saving}
          submitLabel="Save Changes"
          onSubmit={onSubmit}
          onCancel={() => navigate(`/collection/${coin.id}`)}
        />
      </Card>
    </div>
  );
}
