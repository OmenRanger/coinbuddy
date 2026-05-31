# React/Vite Migration Checklist (Static MVP  React/Vite)

Goal: one active app (React/Vite under `src/main.tsx` + `src/pages/*`).

Static MVP implementation (feature reference) currently lives under:
- `src/app/main.js`
- `src/lib/storage.js`
- `src/lib/exporters.js`
- `src/lib/valuation.js`
- `src/lib/coinUtils.js`
- `src/data/articles.js`
- `src/data/auctionSources.js`
- `src/data/schema.js`

Do NOT delete static MVP files until React/Vite has feature parity and tests cover migrated flows.

## Status table

Feature | Static MVP status | React/Vite status | Files to migrate/reuse | Test coverage | Notes
---|---|---|---|---|---
Home dashboard | Implemented | Implemented | `src/pages/HomePage.tsx` | `src/App.test.tsx` | Keep 5 primary actions obvious.
Manual coin entry | Implemented | Implemented | Reuse form patterns | Flow + edit/delete tests | React uses IndexedDB; static uses localStorage.
Scanner / image upload | Implemented | Migrated ✅ | `src/features/scanner/*`, `src/pages/ScanCoinPage.tsx`, uses `CoinForm` | `src/pages/ScanCoinPage.react-migration.test.tsx` | Obverse/reverse upload with preview + remove/replace; saves to IndexedDB and displays in detail.
Collection search/sort/filter | Implemented | Migrated ✅ | Reuse `src/lib/coinUtils.js` logic (ported to `src/features/collection/collectionQuery.ts`) | `src/pages/CollectionPage.react-migration.test.tsx` | Search + sort + filters + reset + empty state implemented.
Coin detail edit/delete | Implemented | Implemented (Phase 2 complete) | React pages | `src/App.edit-delete.test.tsx` | Confirmation required for delete.
Comparable sales | Implemented | Not yet | Reuse `src/lib/valuation.js` patterns + UI | TBD | Needs add/edit comparables per coin.
Value estimator | Implemented | Not yet | `src/lib/valuation.js` | TBD | Must show low/mid/high + confidence + notes.
Archive JSON/CSV export | Implemented | Not yet | `src/lib/exporters.js` | TBD | Export must include metadata; CSV for spreadsheet.
Printable report | Implemented | Not yet | UI from static MVP | TBD | Printable layout view.
Learn | Implemented | Not yet (page exists) | `src/data/articles.js` | TBD | Migrate static content into React routes.
Auctions | Implemented | Not yet (page exists) | `src/data/auctionSources.js` | TBD | Saved links + add link.
Settings | Implemented | Not yet (page exists) | storage status/export/import UI patterns | TBD | Also explain local storage + backups.
Vault/context docs | Implemented | Implemented | `vault/*`, `docs/*` | N/A | Keep Obsidian compatibility.

## Near-term migration order (next after Phase 2)
1) Collection search/sort/filter (easy win; reuse `coinUtils` logic)
2) Scanner image upload flow
3) Archive exports (JSON/CSV) + printable report
4) Comparable sales + value estimator
5) Learn + Auctions + Settings pages

## Environment note: browser workflow tests
`scripts/browser-test.mjs` expects Playwright/Chromium.
On this Ubuntu 26.04 WSL environment, Playwright's Chromium install is not supported, so browser-test may be skipped with a documented limitation.

## Phase 4 scanner QA closure (Codex risk checklist)
- Object URLs: not used for persistence (no `URL.createObjectURL` usage found).
- Persisted images: FileReader data URLs only (`readFileAsDataUrl`), stored in IndexedDB fields `obverseImageUrl` / `reverseImageUrl`.
- IndexedDB round-trip: covered by React scanner test (save then detail shows images).
- Scanner default: scanner-created coins default `needsReview: true`.
- Missing-photo filter: uses `obverseImageUrl`/`reverseImageUrl` presence (still works for partial/no-photo coins).
- Detail page: renders photos when present; placeholders for missing sides.
- Edit flow: preserves existing images (edit page doesn't change image fields; save spreads existing coin).
- Empty string vs undefined: scanner normalizes to `undefined` when missing; logic checks truthiness.
- Limitation: large photo (data URL) exports can be big and browser quota may be hit (IndexedDB still has limits). Documented as MVP limitation.
