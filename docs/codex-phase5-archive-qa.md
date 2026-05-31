# Codex Phase 5 Archive QA

## Review Scope

- Active branch reviewed: `auto/hermes-codex-launch`
- Latest active commit reviewed: `f4a26a4`
- Review branch: `review/codex-phase5-archive-qa`
- Original Codex MVP checkpoint: `b07883a` remains included.
- React scanner migration commit: `e9b3907` remains included.
- Scanner hardening commit: `8a1d665` remains included.
- Phase 5 archive/export commit: `f4a26a4` is present.

This note is QA/support only. No implementation files were changed.

## Phase 5 Archive/Export QA Result

Phase 5 looks good overall. `src/pages/ArchivePage.tsx` is no longer a stub, loads React coin records through `useCoins`, and uses the IndexedDB-backed data path rather than the static MVP localStorage path.

Confirmed behavior:

- Archive summary is derived from React coin records via `computeArchiveSummary`.
- Summary counts total coins, coins with both photos, coins missing either photo, needs-review coins, and favorite coins.
- Estimated low/mid/high collection totals are calculated where finite estimated values exist and remain unestimated when no values exist.
- JSON export uses a clear `CoinBuddyJsonExport` shape with app name, export type, schema version, timestamp, coin count, summary, coin records, and a warning note.
- JSON export intentionally may include embedded image data URLs because it exports full coin records.
- CSV export excludes raw image data URLs and uses `Has Front Photo` / `Has Back Photo` columns instead.
- CSV escaping handles commas, quotes, and newlines through `escapeCsvCell`.
- Printable report renders title, generated date, summary, disclaimer, coin list, storage location, notes, and photo thumbnails/placeholders.
- Print action uses the simple browser print flow with `window.print()`.
- Empty archive state is clear and friendly: add a coin, then come back to export records.
- Appraisal, insurance, grading, and value-estimate disclaimers are visible and appropriately cautious.

## Bugs, Gaps, And Small Patches For Hermes

1. Documentation alignment is now stale. `README.md` and `docs/codex-build-handoff.md` still describe the dependency-light static PWA as the active verified MVP and React/Vite as a future migration path. That was accurate at the earlier checkpoint, but the active branch now has migrated React collection, scanner, and archive/export flows. Do not edit during active feature work unless assigned; update before final MVP handoff.
2. `docs/react-migration-checklist.md` has the right status table for Phase 5, but its near-term migration order still starts with already-migrated collection, scanner, and archive work. Refresh it after Phase 6 planning is accepted.
3. Several React UI/doc strings show mojibake or encoding artifacts in local output, including loading text, apostrophes, directional arrows, and migrated checkmarks. This is UX polish, not a Phase 5 behavior blocker, but it should be cleaned before final handoff.
4. React CSV export omits some static MVP columns: `Confidence`, `Acquisition Date`, and `Acquisition Source`. The React `Coin` type already has `valueConfidence`, `acquisitionDate`, `acquisitionSource`, and `purchasePrice`, so decide whether these should be added now or after the Phase 6 value work.
5. Printable report does not show per-coin estimated value range yet. That is acceptable before Phase 6, but once comparable sales/value estimates migrate, each report row should show the stored low/mid/high range and confidence.
6. Test coverage is useful but should be tightened. Add explicit tests for exact archive summary counts, estimated total math, `window.print` invocation, download helper invocation or click path, JSON behavior with image fields, CSV newline escaping across full rows, and CSV exclusion of raw data URLs.

## Regression Check Notes

Earlier migrated React flows still appear intact by code review:

- Home dashboard routes to Add, Scan, Collection, Value Estimate, and Archive.
- Manual add coin and edit/delete flows still use the IndexedDB-backed coin model.
- Collection search/sort/filter/reset is still present and includes the missing-photo filter.
- Coin detail still displays saved obverse/reverse images and confirms destructive delete.
- Scanner flow still reads File objects as data URLs, shows previews, supports remove/replace before save, normalizes missing images to `undefined`, saves to IndexedDB, and defaults scanner-created records to `needsReview: true`.

The scanner hardening from `8a1d665` still looks intact.

## Verification Performed

The requested `npm run ...` scripts could not be started in this environment because `npm` is not available on PATH and `node_modules` is absent. That is an environment/tooling limitation, not a Phase 5 app failure.

Available direct checks passed with the bundled Node runtime:

```bash
node scripts/lint.mjs
node --test src/tests/*.test.mjs
node scripts/browser-test.mjs
node scripts/build.mjs
```

Results:

- Static lint passed.
- Static Node tests passed: 8/8.
- Browser workflow test passed.
- Static build completed and wrote `dist/`.

React TypeScript/Vitest verification was not runnable locally without npm/dependencies:

```bash
npm run react:build
npm run react:test
```

## Phase 6 Comparable Sales + Value Estimator Recommendations

### Data Model

The React `Coin` type already supports the main Phase 6 fields:

- `estimatedValueLow?: number`
- `estimatedValueMid?: number`
- `estimatedValueHigh?: number`
- `valueConfidence?: "low" | "medium" | "high"`
- `valueSources?: ValueSource[]`

`ValueSource` already supports:

- `id`
- `sourceName`
- `sourceUrl`
- `saleDate`
- `observedPrice`
- `notes`

No major TypeScript model addition appears required for the first Phase 6 pass. Consider adding validation helpers rather than changing the stored shape.

### Logic To Port

Port `src/lib/valuation.js` into a React/TypeScript module, likely under `src/features/valuation/valuation.ts`.

Recommended functions:

- `normalizeValueSource(input)`
- `calculateEstimateFromSources(sources)`
- `applyEstimateToCoin(coin, sources)`
- `roundCurrency(value)`

Keep the existing simple calculation for the MVP:

- Low estimate: minimum finite observed price.
- High estimate: maximum finite observed price.
- Mid estimate: average finite observed price, rounded to cents.
- Confidence: low for 1-2 sales, medium for 3-4, high for 5 or more.

### UI Flow

Start from `src/pages/CoinDetailPage.tsx` instead of a separate global-only estimator. The most useful mother-friendly path is:

- Open a coin.
- Tap `Add sale example`.
- Enter `Where did you see it?`, `Observed price`, `Sale date`, optional URL, and notes.
- Save.
- CoinBuddy updates `Estimated market range` and `Estimate confidence`.
- Show `This is not an appraisal` near the range.

Recommended plain-language labels:

- `Add sale example`
- `Observed price`
- `Where did you see it?`
- `Sale date`
- `Estimate confidence`
- `Estimated market range`
- `This is not an appraisal`

The existing `/value-estimate` route exists but is still a placeholder. Use it as a simple calculator or helper page after the coin-detail workflow is solid. If it remains in the home actions, it should not feel like a dead end after Phase 6.

### Persistence

Store value sources directly on the coin record in IndexedDB through `upsertCoin`, then update the derived estimate fields on the same save.

Recommended behavior:

- Add comparable sale.
- Edit comparable sale.
- Remove comparable sale.
- Recalculate estimate after every change.
- Persist `valueSources`, `estimatedValueLow`, `estimatedValueMid`, `estimatedValueHigh`, and `valueConfidence`.
- Preserve manual notes without forcing a grading/appraisal workflow.

### Archive/Export Integration

After Phase 6:

- Archive summary should continue to use stored estimated values.
- JSON export can include full `valueSources` because JSON is the full archive format.
- CSV should include estimated low/mid/high and confidence.
- Decide whether CSV should include source names/dates in a compact text column; do not include raw image data URLs.
- Printable report should show each coin's estimated range and confidence.

### Phase 6 Test Cases

Add tests for:

- `calculateEstimateFromSources` low/mid/high/confidence behavior.
- Empty and invalid price sources.
- Add comparable sale from coin detail.
- Edit comparable sale and verify recalculation.
- Remove comparable sale and verify recalculation.
- Values persist after reload through IndexedDB.
- Archive summary totals update from stored estimated values.
- JSON export includes value fields and value sources.
- CSV export includes value fields and confidence but no image data URLs.
- Disclaimer text remains visible near estimates.

## Static MVP Files To Reuse As References

- `src/lib/valuation.js`: strongest direct logic reference for Phase 6.
- `src/lib/coinUtils.js`: currency formatting, value range label, collection stat patterns.
- `src/lib/exporters.js`: CSV column parity and archive intent reference.
- `src/app/main.js`: static comparable-sales UX, report preview, and value-estimate flow reference.
- `src/data/schema.js`: static shape and defaults reference, especially `valueSources`.

## Static MVP Files Not To Reuse Directly

- `src/lib/storage.js`: localStorage-specific and should not be reused in the React IndexedDB app.
- DOM string rendering from `src/app/main.js`: useful for behavior reference only; port to React components.
- Static hash routing patterns: React Router is already the active routing approach.
