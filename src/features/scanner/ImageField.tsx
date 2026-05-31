import { useRef } from 'react';

export function ImageField(props: {
  label: string;
  helper?: string;
  value: string | null;
  onChange: (next: string | null) => void;
  onPickFile: (file: File) => Promise<void>;
  inputName: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="grid gap-2">
      <div>
        <p className="text-sm font-semibold">{props.label}</p>
        {props.helper ? <p className="text-sm text-ledger-muted">{props.helper}</p> : null}
      </div>

      {props.value ? (
        <div className="grid gap-2">
          <div className="overflow-hidden rounded-xl border border-ledger-border bg-ledger-paper">
            <img
              src={props.value}
              alt={props.label}
              className="h-56 w-full object-contain bg-white"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
              onClick={() => inputRef.current?.click()}
            >
              Replace photo
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold text-ledger-oxblood"
              onClick={() => props.onChange(null)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <div className="rounded-xl border border-dashed border-ledger-border bg-ledger-paper p-4">
            <p className="text-base">No photo yet.</p>
            <p className="mt-1 text-sm text-ledger-muted">Use Choose photo or Take photo if your device supports it.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
              onClick={() => inputRef.current?.click()}
            >
              Choose photo
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        name={props.inputName}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) return;
          await props.onPickFile(file);
          // allow re-picking the same file (guarded for test environments)
          try {
            e.currentTarget.value = '';
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
}
