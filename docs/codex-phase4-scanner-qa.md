# Codex Phase 4 Scanner QA

## Checkpoint

- Reviewed branch: `auto/hermes-codex-launch`
- Latest reviewed commit: `e9b3907`
- Review branch: `review/codex-phase4-scanner-qa`
- Earlier MVP checkpoint `b07883a`: included in history

## Scanner QA Result

The React scanner migration is structurally sound and matches the main Phase 4 plan:

- Front/back image data is read with `FileReader.readAsDataURL(...)` in `src/features/scanner/readFile.ts`.
- No `URL.createObjectURL(...)` persistence was found.
- `ScanCoinPage.tsx` saves `obverseImageUrl` and `reverseImageUrl` through `createCoin(...)` and `upsertCoin(...)`, so the data URLs round-trip through IndexedDB.
- `ImageField.tsx` shows image previews before save.
- `ImageField.tsx` supports remove and replace before save.
- `CoinDetailPage.tsx` displays saved front/back images.
- `CollectionPage.tsx` missing-photo filter remains compatible because it checks `obverseImageUrl` and `reverseImageUrl`.
- Empty string and missing image values are normalized safely by `createCoin(...)`.

## Recommended Scanner Patches

1. Scanner-created coins should default to needs review.
   - Current `ScanCoinPage.tsx` initializes `coinToFormState(null)`, so `needsReview` defaults to `false`.
   - Static MVP defaulted scanner records to needs review.
   - Suggested patch: initialize scan form state with `coinToFormState({ needsReview: true })`, while still allowing the user to uncheck it.

2. Add a direct replace-image test.
   - Replace behavior is implemented by re-opening the hidden file input, but the scanner test only covers initial upload and remove.
   - Add a test that uploads one file, clicks `Replace photo`, uploads a different file, and confirms the preview still appears and save works.

3. Add a default-needs-review test.
   - After scanner save, assert the detail page shows the "Needs review" badge or assert the saved record has `needsReview: true`.

4. Clean visible mojibake before final UX review.
   - Scanner and shared form copy currently include corrupted apostrophe/dash/quote characters in a few places, for example "isnt" and "Start simple ".
   - Use plain ASCII copy or verified UTF-8 so the mother-friendly polish does not get undercut.

These are small patches. I did not see evidence of object URL persistence, broken IndexedDB assumptions, or incompatible image field modeling.

## Scanner Test Coverage Notes

Existing coverage in `src/pages/ScanCoinPage.react-migration.test.tsx` is good for:

- scanner route renders
- front/back upload inputs exist
- previews appear
- saving navigates to detail
- detail shows both images
- remove-before-save works

Existing coverage in `src/pages/CollectionPage.react-migration.test.tsx` covers:

- missing-photo filter excludes coins with both images
- missing-photo filter includes coins missing one side

Suggested additional scanner tests:

- scanner-created coin defaults to needs review
- replace front or back image before save
- save with only one side uploaded still works and appears in missing-photo filter
- edit/delete flow preserves image fields after editing metadata
- `readFileAsDataUrl(...)` rejects cleanly on file-read failure, if practical to simulate

## Phase 5 Archive/Export Recommendations

Phase 5 should migrate Archive JSON/CSV export and printable report without depending on the static localStorage layer.

### Export Data Source

- Use `listCoins()` from `src/lib/db.ts` or `useCoins()` in `ArchivePage.tsx`.
- Do not read from `src/lib/storage.js`; it is localStorage-specific and belongs to the static MVP reference path.
- Keep exports based on the React `Coin` type from `src/lib/types.ts`.

### TypeScript Exporter

Adapt `src/lib/exporters.js` into a TypeScript module, likely `src/lib/exporters.ts` or `src/features/archive/exporters.ts`.

Recommended functions:

- `buildCollectionReport(coins: Coin[], notes?: string)`
- `exportCoinsAsJson(coins: Coin[]): string`
- `exportCoinsAsCsv(coins: Coin[]): string`
- `csvCell(value: unknown): string`
- optional `downloadText(filename: string, text: string, type: string)`

Reuse the static exporter logic, but type it and update language from "local-first CoinBuddy MVP" if Hermes wants React-specific wording.

### JSON Shape

Keep JSON as the full backup shape:

```json
{
  "app": "CoinBuddy",
  "version": "0.1.0",
  "schemaVersion": 1,
  "exportedAt": "ISO timestamp",
  "report": {
    "id": "report-id",
    "title": "CoinBuddy Collection Report",
    "createdAt": "ISO timestamp",
    "coinIds": [],
    "totalEstimatedLow": 0,
    "totalEstimatedMid": 0,
    "totalEstimatedHigh": 0,
    "notes": "Exported from CoinBuddy."
  },
  "coins": []
}
```

JSON may include `obverseImageUrl` and `reverseImageUrl` for full backup portability, but the UI should warn that image-heavy JSON exports can become large.

### CSV Shape

CSV should be spreadsheet-friendly and should not include raw image data URLs.

Suggested CSV fields:

- Name
- Country
- Denomination
- Year
- Mint Mark
- Condition
- Estimate Low
- Estimate Mid
- Estimate High
- Confidence
- Storage Location
- Acquisition Date
- Acquisition Source
- Needs Review
- Favorite
- Has Front Photo
- Has Back Photo
- Notes

Reason: raw data URLs make CSV huge, unreadable, and awkward for insurance review. Use `Yes` or `No` photo flags instead.

### CSV Escaping

Retain and test the static `csvCell(...)` approach:

- wrap every cell in quotes
- double embedded quotes
- preserve commas and newlines inside quoted cells
- render `undefined` and `null` as empty cells

Add tests for names/notes containing commas, quotes, and line breaks.

### Printable Report

Printable report should include:

- prepared date
- total coins
- total estimated low/mid/high
- missing photo count
- needs-review count
- insurance-prep disclaimer
- coin list with name, year, denomination, country, storage location, value range, needs-review marker, and photo status
- optional thumbnails if images are present, but keep the print layout readable

The static `renderArchive(...)` and `reportCoinCard(...)` in `src/app/main.js` are good UX references, not React code to copy directly.

### Phase 5 Tests

Add tests for:

- JSON export parses and includes app/version/schema/exportedAt/report/coins
- JSON export includes image fields for full backup
- CSV export excludes raw data URLs
- CSV export includes photo flags
- CSV escaping handles quotes, commas, and newlines
- empty collection archive page has helpful empty state
- archive page export buttons trigger downloadable files
- printable report includes disclaimer and summary totals
- report handles coins with no estimates and no photos gracefully

## Static MVP Files To Reuse

Reuse directly after TypeScript adaptation:

- `src/lib/exporters.js`
- `src/lib/coinUtils.js` for formatting and collection totals, or port needed functions into typed React utilities

Reuse as UX references:

- `src/app/main.js` `renderArchive(...)`
- `src/app/main.js` `reportCoinCard(...)`
- `src/app/main.js` `downloadText(...)`

Do not reuse directly:

- `src/lib/storage.js`, because React uses IndexedDB through `src/lib/db.ts`
- DOM-string rendering from `src/app/main.js`
