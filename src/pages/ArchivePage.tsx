import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { useCoins } from '../lib/useCoins';
import { computeArchiveSummary } from '../features/archive/summary';
import { createCsvExport, createJsonExport } from '../features/archive/exporters';
import { downloadTextFile } from '../features/archive/download';

export function ArchivePage() {
  const { coins, error } = useCoins();

  const summary = useMemo(() => {
    if (!coins) return null;
    return computeArchiveSummary(coins);
  }, [coins]);

  return (
    <div className="grid gap-4">
      <div className="no-print" aria-hidden="true" />
      <Card>
        <h1 className="font-serif text-3xl font-bold">Archive & Reports</h1>
        <p className="mt-2 text-base text-ledger-muted">
          Collection records are stored on this device. Export regularly for backup, insurance preparation, or estate documentation.
        </p>
        <p className="mt-3 text-sm text-ledger-muted">
          Disclaimer: CoinBuddy records and value ranges are for personal documentation and research support only. They are not official appraisals, professional grading results, or proof of insurance coverage.
        </p>
      </Card>

      {error ? (
        <Card>
          <p className="text-ledger-oxblood">{error}</p>
        </Card>
      ) : null}

      {coins === null ? (
        <Card>
          <p className="text-base">Loading archive…</p>
        </Card>
      ) : coins.length === 0 ? (
        <Card>
          <h2 className="font-serif text-2xl font-bold">No records yet</h2>
          <p className="mt-2 text-base text-ledger-muted">
            Add a coin, then come back here to export your records.
          </p>
        </Card>
      ) : summary ? (
        <>
          <Card>
            <h2 className="font-serif text-2xl font-bold">Collection records</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Stat label="Total coins" value={summary.totalCoins} />
              <Stat label="Photos on file (front + back)" value={summary.coinsWithPhotos} />
              <Stat label="Coins missing photos" value={summary.coinsMissingPhotos} />
              <Stat label="Coins needing review" value={summary.needsReviewCount} />
              <Stat label="Favorite coins" value={summary.favoriteCount} />
              <Stat
                label="Estimated collection range (low / mid / high)"
                value={`${formatMoney(summary.estimatedValueLowTotal)} / ${formatMoney(summary.estimatedValueMidTotal)} / ${formatMoney(summary.estimatedValueHighTotal)}`}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-serif text-2xl font-bold">Exports</h2>
            <p className="mt-2 text-base text-ledger-muted">
              JSON is best for a full archive (may include photos). CSV is best for spreadsheets.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-ledger-ink px-4 text-base font-semibold text-ledger-paper"
                onClick={() => {
                  const payload = createJsonExport(coins);
                  downloadTextFile({
                    filename: `coinbuddy-archive-${new Date().toISOString().slice(0, 10)}.json`,
                    content: JSON.stringify(payload, null, 2),
                    mime: 'application/json',
                  });
                }}
              >
                Export JSON
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
                onClick={() => {
                  const csv = createCsvExport(coins);
                  downloadTextFile({
                    filename: `coinbuddy-archive-${new Date().toISOString().slice(0, 10)}.csv`,
                    content: csv,
                    mime: 'text/csv',
                  });
                }}
              >
                Export CSV
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper px-4 text-base font-semibold"
                onClick={() => window.print()}
              >
                Print Report
              </button>
            </div>
            <p className="mt-3 text-sm text-ledger-muted">
              Note: exports that include photos can be large.
            </p>
          </Card>

          <div className="printable-report">
            <Card>
              <h2 className="font-serif text-2xl font-bold">CoinBuddy Collection Report</h2>
              <p className="mt-1 text-sm text-ledger-muted">Generated: {new Date().toLocaleString()}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Stat label="Total coins" value={summary.totalCoins} />
                <Stat label="Photos on file" value={summary.coinsWithPhotos} />
                <Stat label="Coins needing review" value={summary.needsReviewCount} />
                <Stat label="Coins missing photos" value={summary.coinsMissingPhotos} />
              </div>

              <p className="mt-4 text-sm text-ledger-muted">
                Estimated value ranges are not official appraisals or guaranteed sale prices. For high-value coins or formal coverage, consult a qualified appraiser, grading service, or insurance professional.
              </p>

              <div className="mt-6 grid gap-3">
                {coins.map((coin) => (
                  <div key={coin.id} className="rounded-xl border border-ledger-border bg-ledger-paper p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{coin.name}</p>
                        <p className="text-sm text-ledger-muted">
                          {coin.year ? `${coin.year} · ` : ''}
                          {coin.denomination ?? 'Coin'}
                          {coin.country ? ` · ${coin.country}` : ''}
                        </p>
                        {coin.storageLocation ? (
                          <p className="mt-1 text-sm text-ledger-muted">Storage: {coin.storageLocation}</p>
                        ) : null}
                      </div>
                      {coin.needsReview ? (
                        <span className="rounded-full bg-ledger-oxblood/10 px-3 py-1 text-xs font-semibold text-ledger-oxblood">
                          Needs review
                        </span>
                      ) : null}
                    </div>

                    {(coin.obverseImageUrl || coin.reverseImageUrl) ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {coin.obverseImageUrl ? (
                          <img
                            src={coin.obverseImageUrl}
                            alt="Front of coin"
                            className="h-32 w-full rounded-lg border border-ledger-border object-contain bg-white"
                          />
                        ) : (
                          <div className="h-32 rounded-lg border border-dashed border-ledger-border bg-ledger-card p-3 text-sm text-ledger-muted">
                            Front photo not added
                          </div>
                        )}
                        {coin.reverseImageUrl ? (
                          <img
                            src={coin.reverseImageUrl}
                            alt="Back of coin"
                            className="h-32 w-full rounded-lg border border-ledger-border object-contain bg-white"
                          />
                        ) : (
                          <div className="h-32 rounded-lg border border-dashed border-ledger-border bg-ledger-card p-3 text-sm text-ledger-muted">
                            Back photo not added
                          </div>
                        )}
                      </div>
                    ) : null}

                    {coin.notes ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm">Notes: {coin.notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat(props: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-ledger-paper px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ledger-muted">{props.label}</p>
      <p className="mt-1 text-base font-semibold text-ledger-ink">{props.value}</p>
    </div>
  );
}

function formatMoney(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not estimated';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
