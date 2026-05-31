import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCoin } from '../lib/coinModel';
import { upsertCoin } from '../lib/db';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import { CoinForm, coinToFormState, type CoinFormState } from '../features/coins/CoinForm';

const initialState: CoinFormState = coinToFormState(null);

export function AddCoinPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<CoinFormState>(initialState);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const coin = createCoin({
        name: state.name,
        year: state.year || undefined,
        country: state.country || undefined,
        denomination: state.denomination || undefined,
        mintMark: state.mintMark || undefined,
        condition: state.condition || undefined,
        storageLocation: state.storageLocation || undefined,
        notes: state.notes || undefined,
        needsReview: state.needsReview,
      });
      await upsertCoin(coin);
      toast('Saved to My Collection.');
      navigate(`/collection/${coin.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <h1 className="font-serif text-3xl font-bold">Add Coin Manually</h1>
        <p className="mt-2 text-base text-ledger-muted">
          Start simple. You can add photos and value estimates later.
        </p>
      </Card>

      <Card>
        <CoinForm
          state={state}
          setState={setState}
          saving={saving}
          submitLabel="Add Coin to My Collection"
          onSubmit={onSubmit}
          onCancel={() => navigate('/')}
        />
      </Card>
    </div>
  );
}
