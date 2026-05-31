import { useMemo, useState } from 'react';
import type { ValueSource } from '../../lib/types';

function newId() {
  return `vs-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ComparableSalesEditor(props: {
  valueSources: ValueSource[];
  onChange: (next: ValueSource[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ValueSource>>({});

  const hasAny = props.valueSources.length > 0;

  const editing = useMemo(() => {
    if (!editingId) return null;
    return props.valueSources.find((s) => s.id === editingId) ?? null;
  }, [editingId, props.valueSources]);

  function startAdd() {
    const id = newId();
    setEditingId(id);
    setDraft({
      id,
      sourceName: '',
      sourceUrl: '',
      saleDate: '',
      observedPrice: undefined,
      notes: '',
    });
  }

  function startEdit(source: ValueSource) {
    setEditingId(source.id);
    setDraft({ ...source });
  }

  function cancel() {
    setEditingId(null);
    setDraft({});
  }

  function save() {
    const src: ValueSource = {
      id: String(draft.id ?? newId()),
      sourceName: String(draft.sourceName ?? '').trim(),
      sourceUrl: (String(draft.sourceUrl ?? '').trim() || undefined) as string | undefined,
      saleDate: (String(draft.saleDate ?? '').trim() || undefined) as string | undefined,
      observedPrice: typeof draft.observedPrice === 'number' ? draft.observedPrice : undefined,
      notes: (String(draft.notes ?? '').trim() || undefined) as string | undefined,
    };

    if (!src.sourceName) {
      // minimal guard: user-friendly validation stays near the field
      return;
    }

    const existingIndex = props.valueSources.findIndex((s) => s.id === src.id);
    const next = [...props.valueSources];
    if (existingIndex >= 0) next[existingIndex] = src;
    else next.unshift(src);

    props.onChange(next);
    cancel();
  }

  function remove(id: string) {
    const next = props.valueSources.filter((s) => s.id !== id);
    props.onChange(next);
    if (editingId === id) cancel();
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Sale examples</p>
          <p className="text-sm text-ledger-muted">Add real sale examples you found online or in a book.</p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-ledger-ink px-4 text-sm font-semibold text-ledger-paper"
          onClick={startAdd}
        >
          Add sale example
        </button>
      </div>

      {!hasAny ? (
        <div className="rounded-xl border border-dashed border-ledger-border bg-ledger-paper p-4 text-sm text-ledger-muted">
          No sale examples added yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {props.valueSources.map((s) => (
            <div key={s.id} className="rounded-xl border border-ledger-border bg-ledger-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{s.sourceName}</p>
                  <p className="mt-1 text-sm text-ledger-muted">
                    {s.observedPrice != null ? `$${s.observedPrice}` : 'No price'}
                    {s.saleDate ? ` · ${s.saleDate}` : ''}
                  </p>
                  {s.sourceUrl ? (
                    <a className="mt-1 block text-sm underline" href={s.sourceUrl} target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : null}
                  {s.notes ? <p className="mt-2 text-sm">{s.notes}</p> : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-ledger-border bg-ledger-card px-3 text-sm font-semibold"
                    onClick={() => startEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-ledger-border bg-ledger-card px-3 text-sm font-semibold text-ledger-oxblood"
                    onClick={() => remove(s.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId ? (
        <div className="rounded-2xl border border-ledger-border bg-ledger-card p-4">
          <p className="text-sm font-semibold">{editing ? 'Edit sale example' : 'New sale example'}</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <LabeledInput
              label="Where did you see it?"
              placeholder="Example: eBay sold listing"
              value={String(draft.sourceName ?? '')}
              onChange={(v) => setDraft({ ...draft, sourceName: v })}
            />
            <LabeledInput
              label="Observed price"
              placeholder="Example: 12.50"
              value={draft.observedPrice == null ? '' : String(draft.observedPrice)}
              inputMode="decimal"
              onChange={(v) => {
                const n = Number(v);
                setDraft({ ...draft, observedPrice: v === '' ? undefined : Number.isFinite(n) ? n : undefined });
              }}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <LabeledInput
              label="Link, if available"
              placeholder="https://…"
              value={String(draft.sourceUrl ?? '')}
              onChange={(v) => setDraft({ ...draft, sourceUrl: v })}
            />
            <LabeledInput
              label="Sale date"
              placeholder="YYYY-MM-DD"
              value={String(draft.saleDate ?? '')}
              onChange={(v) => setDraft({ ...draft, saleDate: v })}
            />
          </div>

          <div className="mt-3">
            <LabeledTextarea
              label="Notes about this example"
              placeholder="Anything helpful: grade, condition notes, differences…"
              value={String(draft.notes ?? '')}
              onChange={(v) => setDraft({ ...draft, notes: v })}
            />
          </div>

          {String(draft.sourceName ?? '').trim() === '' ? (
            <p className="mt-2 text-sm text-ledger-oxblood">Please enter “Where did you see it?”</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
              onClick={save}
            >
              Save example
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
              onClick={cancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LabeledInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold">{props.label}</span>
      <input
        className="h-11 rounded-xl border border-ledger-border bg-ledger-paper px-3 text-base outline-none focus:ring-2 focus:ring-ledger-gold"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        inputMode={props.inputMode}
      />
    </label>
  );
}

function LabeledTextarea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold">{props.label}</span>
      <textarea
        className="min-h-24 rounded-xl border border-ledger-border bg-ledger-paper px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ledger-gold"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
      />
    </label>
  );
}
