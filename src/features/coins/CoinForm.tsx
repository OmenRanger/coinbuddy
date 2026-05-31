import { useMemo } from 'react';

export type CoinFormState = {
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

export function coinToFormState(input?: Partial<CoinFormState> | null): CoinFormState {
  return {
    name: input?.name ?? '',
    year: input?.year ?? '',
    country: input?.country ?? '',
    denomination: input?.denomination ?? '',
    mintMark: input?.mintMark ?? '',
    condition: input?.condition ?? '',
    storageLocation: input?.storageLocation ?? '',
    notes: input?.notes ?? '',
    needsReview: input?.needsReview ?? false,
  };
}

export function CoinForm(props: {
  state: CoinFormState;
  setState: (next: CoinFormState) => void;
  saving: boolean;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onCancel: () => void;
}) {
  const fieldIdPrefix = useMemo(() => `coin-form-${Math.random().toString(16).slice(2)}`, []);

  return (
    <form className="grid gap-4" onSubmit={props.onSubmit} aria-label="Coin form">
      <Field
        id={`${fieldIdPrefix}-name`}
        label="Coin name"
        helper="Example: 1909 Lincoln Cent (or just: Lincoln penny)"
        value={props.state.name}
        onChange={(value) => props.setState({ ...props.state, name: value })}
        required
        autoFocus
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`${fieldIdPrefix}-year`}
          label="Year"
          helper="If you’re not sure, you can leave it blank for now."
          value={props.state.year}
          onChange={(value) => props.setState({ ...props.state, year: value })}
          inputMode="numeric"
        />
        <Field
          id={`${fieldIdPrefix}-mintmark`}
          label="Mint mark"
          helper="A small letter like D, S, or P (sometimes blank)."
          value={props.state.mintMark}
          onChange={(value) => props.setState({ ...props.state, mintMark: value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`${fieldIdPrefix}-country`}
          label="Country"
          value={props.state.country}
          onChange={(value) => props.setState({ ...props.state, country: value })}
        />
        <Field
          id={`${fieldIdPrefix}-denom`}
          label="Denomination"
          helper="Example: Penny, Nickel, Dime, Quarter"
          value={props.state.denomination}
          onChange={(value) => props.setState({ ...props.state, denomination: value })}
        />
      </div>

      <Field
        id={`${fieldIdPrefix}-condition`}
        label="Condition (optional)"
        helper="If you’re unsure, leave this blank."
        value={props.state.condition}
        onChange={(value) => props.setState({ ...props.state, condition: value })}
      />

      <Field
        id={`${fieldIdPrefix}-storage`}
        label="Storage location"
        helper="Example: Blue binder, Safe deposit box, Drawer A"
        value={props.state.storageLocation}
        onChange={(value) => props.setState({ ...props.state, storageLocation: value })}
      />

      <Field
        id={`${fieldIdPrefix}-notes`}
        label="Notes"
        helper="Anything you want to remember about this coin."
        value={props.state.notes}
        onChange={(value) => props.setState({ ...props.state, notes: value })}
        multiline
      />

      <label className="flex items-start gap-3 rounded-xl border border-ledger-border bg-ledger-paper p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={props.state.needsReview}
          onChange={(e) => props.setState({ ...props.state, needsReview: e.target.checked })}
        />
        <span>
          <span className="block font-semibold">Mark as “Needs review”</span>
          <span className="block text-sm text-ledger-muted">Use this if you want to double-check details later.</span>
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={props.saving}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper shadow-card disabled:opacity-60"
        >
          {props.saving ? 'Saving…' : props.submitLabel}
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
          onClick={props.onCancel}
          disabled={props.saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field(props: {
  id: string;
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={props.id} className="text-sm font-semibold text-ledger-ink">
        {props.label}
        {props.required ? <span className="text-ledger-oxblood"> *</span> : null}
      </label>
      {props.multiline ? (
        <textarea
          id={props.id}
          className="min-h-24 rounded-xl border border-ledger-border bg-ledger-paper px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ledger-gold"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          id={props.id}
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
