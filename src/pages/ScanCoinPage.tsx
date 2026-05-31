import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCoin } from '../lib/coinModel';
import { upsertCoin } from '../lib/db';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import { CoinForm, coinToFormState, type CoinFormState } from '../features/coins/CoinForm';
import { ImageField } from '../features/scanner/ImageField';
import { readFileAsDataUrl } from '../features/scanner/readFile';

export function ScanCoinPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [obverse, setObverse] = useState<string | null>(null);
  const [reverse, setReverse] = useState<string | null>(null);
  const [state, setState] = useState<CoinFormState>(() => coinToFormState(null));
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
        obverseImageUrl: obverse || undefined,
        reverseImageUrl: reverse || undefined,
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
        <h1 className="font-serif text-3xl font-bold">Scan or Add Coin Photos</h1>
        <p className="mt-2 text-base text-ledger-muted">
          Take or choose clear photos, then add a few details. If your camera isnt available, you can still choose photos from your device.
        </p>
      </Card>

      <Card>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <h2 className="font-serif text-2xl font-bold">1) Front photo</h2>
            <ImageField
              label="Front of coin"
              helper="Tip: hold the coin steady and fill the frame."
              value={obverse}
              onChange={setObverse}
              inputName="obverse"
              onPickFile={async (file) => {
                const url = await readFileAsDataUrl(file);
                setObverse(url);
              }}
            />
          </div>

          <div className="grid gap-3">
            <h2 className="font-serif text-2xl font-bold">2) Back photo</h2>
            <ImageField
              label="Back of coin"
              helper="Tip: avoid glare from bright lights."
              value={reverse}
              onChange={setReverse}
              inputName="reverse"
              onPickFile={async (file) => {
                const url = await readFileAsDataUrl(file);
                setReverse(url);
              }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl font-bold">3) Add coin details</h2>
        <p className="mt-2 text-base text-ledger-muted">
          Start simple  you can edit later.
        </p>
        <div className="mt-4">
          <CoinForm
            state={state}
            setState={setState}
            saving={saving}
            submitLabel="Save to My Collection"
            onSubmit={onSubmit}
            onCancel={() => navigate('/')}
          />
        </div>
      </Card>
    </div>
  );
}
