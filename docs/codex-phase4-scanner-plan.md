# Codex Phase 4 Scanner Migration Plan

## Checkpoint

- Reviewed branch: `auto/hermes-codex-launch`
- Review branch: `review/codex-phase4-scanner-plan`
- Latest reviewed commit: `b434ae8`
- Status update: React collection search/sort/filter is migrated. Scanner/image upload is the next active gap.

## Static MVP Scanner Reference

The static scanner lives inside `src/app/main.js` and is implemented as the scanner mode of the shared coin form:

- Route handler: `scan: () => renderCoinForm({ mode: "scan" })`
- Form copy: "Attach clear front and back photos, then confirm the details you know."
- Photo fields: `imageUploadBlock("obverseImage", "Front photo", coin.obverseImageUrl)` and `imageUploadBlock("reverseImage", "Back photo", coin.reverseImageUrl)`
- Preview behavior: `wireImagePreview(form, "obverseImage")` and `wireImagePreview(form, "reverseImage")`
- File conversion: `imageInputToDataUrl(input, fallback)` uses `FileReader.readAsDataURL(file)`
- Save behavior: `readCoinForm(...)` writes `obverseImageUrl` and `reverseImageUrl` into the coin record
- Scanner-specific default: `needsReview` is checked for scan mode

Keep the UX pattern: two clear photo upload controls, visible preview, manual fields, gentle helper text, and a complete manual fallback.

## React Adaptation

Recommended shape:

1. Extend `CoinFormState` in `src/features/coins/CoinForm.tsx` with:
   - `obverseImageUrl: string`
   - `reverseImageUrl: string`
2. Update `coinToFormState(...)` to hydrate those fields from an existing coin.
3. Add a reusable image picker inside `CoinForm` or a small sibling component such as `CoinImageInput`.
4. Implement a React equivalent of `imageInputToDataUrl`:
   - input: `File | undefined`
   - output: `Promise<string | undefined>`
   - preserve existing image URL when no new file is selected
5. In `AddCoinPage.tsx` and `EditCoinPage.tsx`, pass `state.obverseImageUrl` and `state.reverseImageUrl` into `createCoin(...)`.
6. Make `ScanCoinPage.tsx` reuse the same form but with scanner-specific copy, submit label, and `needsReview: true` initial state.
7. Update `CoinDetailPage.tsx` to render front/back images or clear "photo not added" placeholders.
8. Keep `CollectionPage.tsx` missing-photo filter behavior unchanged; it already depends on `obverseImageUrl` and `reverseImageUrl`.

React should persist the data URLs through `src/lib/db.ts` with no database version change required because IndexedDB stores the whole `Coin` object in one object store.

## Coin Model Fields Required

Already present in `src/lib/types.ts` and `src/lib/coinModel.ts`:

- `obverseImageUrl?: string`
- `reverseImageUrl?: string`
- `needsReview?: boolean`
- `updatedAt: string`

No new TypeScript model fields are required for the MVP scanner. If Hermes adds receipt/document upload later, keep that separate from coin face images.

## Static UX Pieces To Reuse

- Front/back naming: "Front photo" and "Back photo"
- Helper copy: "Use a clear photo. Manual details are always available."
- Preview replaces the empty placeholder immediately after file selection
- Scanner save flow goes to the coin detail page after save
- Scanner-created records default to "Needs review"
- Manual details remain editable on the same screen
- Missing-photo signal is visible in collection/detail surfaces

## Test Cases To Add

Unit/component tests:

- `CoinForm` renders front and back image inputs.
- Selecting a front image shows a preview.
- Selecting a back image shows a preview.
- Submitting scan form saves `obverseImageUrl` and `reverseImageUrl`.
- Editing a coin without choosing a new image preserves existing image URLs.
- Editing a coin with one new image updates only that side.
- Scanner flow defaults `needsReview` to true.

Route/workflow tests:

- `/scan` -> upload two images -> fill coin name -> save -> detail page shows both photos.
- Collection "Missing photos" filter includes coins missing either side and excludes coins with both sides.
- Coin detail shows placeholders for missing sides.
- Delete copy still accurately warns that photos are removed from this device.

Data tests:

- `createCoin(...)` preserves image URL fields.
- IndexedDB `upsertCoin` and `getCoin` round-trip data URL fields.

## Risks

- Data URLs can be large. IndexedDB is a better MVP target than `localStorage`, but browser quota can still become a problem for large photo libraries.
- Avoid image resizing/compression in Phase 4 unless Hermes explicitly scopes it. A simple upload path is easier to verify, but document the storage limitation.
- Do not use object URLs for persistence; they are session-local. Object URLs are fine for temporary previews only, but the saved `Coin` record needs a data URL or future storage URL.
- Keep camera capture optional. Use `accept="image/*"` and optionally `capture="environment"`, but do not rely on capture being supported on every browser.
- `src/lib/storage.js` is localStorage-specific and should not be reused in React; use `src/lib/db.ts`.
- Static and React currently use slightly different defaults: static image fields default to empty strings, React normalizes empty strings to `undefined`. Both are compatible with current missing-photo checks, but tests should cover both missing cases.
- Several current React text strings contain mojibake characters from curly quotes/arrows. Scanner work should use plain ASCII or verified UTF-8 copy.

## Recommended Phase 4 Implementation Order

1. Add image fields to `CoinFormState` and `coinToFormState`.
2. Add reusable `CoinImageInput` with preview and helper text.
3. Wire image fields into add/edit save paths.
4. Replace `ScanCoinPage` placeholder with the shared form configured for scan mode.
5. Render image pair in `CoinDetailPage`.
6. Add tests for scan upload, edit preservation, detail rendering, and missing-photo filter.
7. Run React tests plus the existing static checks before any active-branch merge.

## Files To Reuse Or Reference

Reuse as behavior references:

- `src/app/main.js`
- `src/data/schema.js`
- `src/lib/coinUtils.js`

Reuse directly after TypeScript adaptation:

- `imageInputToDataUrl` pattern from `src/app/main.js`
- `obverseImageUrl` and `reverseImageUrl` fields from `src/lib/types.ts`
- IndexedDB persistence path in `src/lib/db.ts`
- Missing-photo query behavior in `src/features/collection/collectionQuery.ts`

Do not reuse directly:

- `src/lib/storage.js`, because it is localStorage-specific.
- The DOM string-rendering code in `src/app/main.js`; port the UX, not the implementation.
