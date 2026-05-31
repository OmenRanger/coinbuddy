import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCoin } from '../lib/coinModel';
import { upsertCoin } from '../lib/db';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';

type FormState = {
  name: string;
  year: string;
  country: string;
  denomination: string;
  mintMark: string;
  condition: string;
  storageLocation: string;
  notes: string;
  needsReview: boolean;
};

const initialState: FormState = {
  name: '',
  year: '',
  country: '',
  denomination: '',
  mintMark: '',
  condition: '',
  storageLocation: '',
  notes: '',
  needsReview: false,
};

export function AddCoinPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<FormState>(initialState);
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
        <form className="grid gap-4" onSubmit={onSubmit} aria-label="Add coin form">
          <Field
            label="Coin name"
            helper="Example: 1909 Lincoln Cent (or just: Lincoln penny)"
            value={state.name}
            onChange={(value) => setState((s) => ({ ...s, name: value }))}
            required
            autoFocus
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Year"
              helper="If youre not sure, you can leave it blank for now."
              value={state.year}
              onChange={(value) => setState((s) => ({ ...s, year: value }))}
              inputMode="numeric"
            />
            <Field
              label="Mint mark"
              helper="A small letter like D, S, or P (sometimes blank)."
              value={state.mintMark}
              onChange={(value) => setState((s) => ({ ...s, mintMark: value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Country"
              value={state.country}
              onChange={(value) => setState((s) => ({ ...s, country: value }))}
            />
            <Field
              label="Denomination"
              helper="Example: Penny, Nickel, Dime, Quarter"
              value={state.denomination}
              onChange={(value) => setState((s) => ({ ...s, denomination: value }))}
            />
          </div>

          <Field
            label="Condition (optional)"
            helper="If youre unsure, leave this blank."
            value={state.condition}
            onChange={(value) => setState((s) => ({ ...s, condition: value }))}
          />

          <Field
            label="Storage location"
            helper="Example: Blue binder, Safe deposit box, Drawer A"
            value={state.storageLocation}
            onChange={(value) => setState((s) => ({ ...s, storageLocation: value }))}
          />

          <Field
            label="Notes"
            helper="Anything you want to remember about this coin."
            value={state.notes}
            onChange={(value) => setState((s) => ({ ...s, notes: value }))}
            multiline
          />

          <label className="flex items-start gap-3 rounded-xl border border-ledger-border bg-ledger-paper p-4">
            <input
              type="checkbox"
              className="mt-1 size-5"
              checked={state.needsReview}
              onChange={(e) => setState((s) => ({ ...s, needsReview: e.target.checked }))}
            />
            <span>
              <span className="block font-semibold">Mark as Needs review</span>
              <span className="block text-sm text-ledger-muted">
                Use this if you want to double-check details later.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add Coin to My Collection'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')} 
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field(props: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const id = props.label.toLowerCase().replace(/\s+/g, '-') + '-field';
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-ledger-ink">
        {props.label}
        {props.required ? <span className="text-ledger-oxblood"> *</span> : null}
      </label>
      {props.multiline ? (
        <textarea
          id={id}
          className="min-h-24 rounded-xl border border-ledger-border bg-ledger-paper px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ledger-gold"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="h-11 rounded-xl border border-ledger-border bg-ledger-paper px-3 text-base outline-none focus:ring-2 focus:ring-ledger-gold"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required={props.required}
          autoFocus={props.autoFocus}
          inputMode={props.inputMode}
        />
      )}
      {props.helper ? <p className="text-sm text-ledger-muted">{props.helper}</p> : null}
    </div>
  );
}

