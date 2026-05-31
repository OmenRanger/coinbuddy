import type { ValueConfidence, ValueSource } from '../../lib/types';
import { computeEstimate, confidenceLabel } from './estimate';

export function ValueEstimateCard(props: {
  valueSources: ValueSource[];
  estimatedValueLow?: number;
  estimatedValueMid?: number;
  estimatedValueHigh?: number;
  valueConfidence?: ValueConfidence;
}) {
  const estimate = computeEstimate(props.valueSources);

  const low = props.estimatedValueLow ?? estimate.low;
  const mid = props.estimatedValueMid ?? estimate.mid;
  const high = props.estimatedValueHigh ?? estimate.high;
  const conf = props.valueConfidence ?? estimate.confidence;

  const hasAny = Boolean(low != null || mid != null || high != null);

  return (
    <div className="grid gap-3 rounded-2xl border border-ledger-border bg-ledger-paper p-4">
      <div>
        <p className="text-sm font-semibold">Estimated market range</p>
        <p className="mt-1 text-sm text-ledger-muted">
          This estimate is based on the sale examples saved for this coin. It is not an official appraisal.
        </p>
      </div>

      {!hasAny ? (
        <div className="rounded-xl border border-dashed border-ledger-border bg-ledger-card p-4 text-sm text-ledger-muted">
          No sale examples added yet.
        </div>
      ) : (
        <div className="grid gap-2">
          <p className="text-base font-semibold">
            {fmtMoney(low)} / {fmtMoney(mid)} / {fmtMoney(high)}
          </p>
          <p className="text-sm text-ledger-muted">
            Estimate confidence: {confidenceLabel(conf)}
            {conf === 'low' ? ' — add more sale examples to improve this.' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

function fmtMoney(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
