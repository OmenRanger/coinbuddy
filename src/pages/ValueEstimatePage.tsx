import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useCoins } from '../lib/useCoins';

function countSources(c: { valueSources?: unknown[] }) {
  return Array.isArray(c.valueSources) ? c.valueSources.length : 0;
}

export function ValueEstimatePage() {
  const { coins, error } = useCoins();

  const stats = useMemo(() => {
    if (!coins) return null;
    const noExamples = coins.filter((c) => countSources(c) === 0);
    const lowConfidence = coins.filter((c) => countSources(c) > 0 && (c.valueConfidence ?? 'low') === 'low');
    const withEstimates = coins.filter((c) =>
      typeof c.estimatedValueMid === 'number' || typeof c.estimatedValueLow === 'number' || typeof c.estimatedValueHigh === 'number',
    );
    const top = [...withEstimates]
      .sort((a, b) => (b.estimatedValueMid ?? 0) - (a.estimatedValueMid ?? 0))
      .slice(0, 10);
    return { noExamples, lowConfidence, withEstimates, top };
  }, [coins]);

  return (
    <div className="grid gap-4">
      <Card>
        <h1 className="font-serif text-3xl font-bold">Value Estimate</h1>
        <p className="mt-2 text-base text-ledger-muted">
          Add sale examples to help estimate a market range. This is not an appraisal.
        </p>
      </Card>

      {error ? (
        <Card>
          <p className="text-ledger-oxblood">{error}</p>
        </Card>
      ) : null}

      {coins === null ? (
        <Card>
          <p className="text-base">Loading…</p>
        </Card>
      ) : coins.length === 0 ? (
        <Card>
          <h2 className="font-serif text-2xl font-bold">No coins yet</h2>
          <p className="mt-2 text-base text-ledger-muted">Add a coin first, then come back here.</p>
          <div className="mt-4">
            <Link
              to="/add"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
            >
              Add coin
            </Link>
          </div>
        </Card>
      ) : stats ? (
        <>
          <Section
            title="Coins needing sale examples"
            helper="These coins don’t have any sale examples yet."
            coins={stats.noExamples}
          />
          <Section
            title="Low-confidence estimates"
            helper="Add 1–3 more sale examples to improve confidence."
            coins={stats.lowConfidence}
          />
          <Section title="Highest estimated coins" helper="Based on your saved sale examples." coins={stats.top} />
        </>
      ) : null}

      <Card>
        <p className="text-sm text-ledger-muted">
          Disclaimer: CoinBuddy value ranges are for personal documentation and research support only. They are not official appraisals,
          professional grading results, or guarantees of sale price. For high-value coins or formal coverage, consult a qualified appraiser,
          grading service, or insurance professional.
        </p>
      </Card>
    </div>
  );
}

function Section(props: {
  title: string;
  helper: string;
  coins: Array<{ id: string; name: string; year?: string; country?: string; denomination?: string; valueSources?: unknown[] }>;
}) {
  return (
    <Card>
      <h2 className="font-serif text-2xl font-bold">{props.title}</h2>
      <p className="mt-1 text-sm text-ledger-muted">{props.helper}</p>

      {props.coins.length === 0 ? (
        <p className="mt-3 text-sm text-ledger-muted">Nothing to show right now.</p>
      ) : (
        <div className="mt-4 grid gap-2">
          {props.coins.map((c) => (
            <Link
              key={c.id}
              to={`/collection/${c.id}`}
              className="block rounded-xl border border-ledger-border bg-ledger-paper p-4 hover:shadow-card"
            >
              <p className="text-base font-semibold">{c.name}</p>
              <p className="mt-1 text-sm text-ledger-muted">
                {c.year ? `${c.year} · ` : ''}
                {c.denomination ?? 'Coin'}
                {c.country ? ` · ${c.country}` : ''}
                {Array.isArray(c.valueSources) ? ` · ${c.valueSources.length} sale example(s)` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
