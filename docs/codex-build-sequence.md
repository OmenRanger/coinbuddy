# Codex Build Sequence (MVP)

Branch: `auto/hermes-codex-launch`

## Phase 0  Repo setup
1. Create Vite + React + TS app.
2. Add Tailwind + basic design tokens (ledger palette via CSS variables).
3. Add routing (React Router) and page skeletons:
   - Home
   - Scan Coin
   - Add Coin
   - My Collection
   - Coin Detail
   - Value Estimate
   - Archive & Reports
   - Learn
   - Auctions
   - Settings
4. Add a simple layout with bottom nav (mobile) + header.

## Phase 1  First working flow (must be complete before adding more)
Home  Add Coin Manually  Save  My Collection  Coin Detail
- Implement Coin type + storage service (IndexedDB).
- Implement Add Coin form with minimal required fields.
- Save success toast + redirect.
- Collection list card UI.
- Coin detail view.

## Phase 2  Edit/Delete
- Edit coin form (reuse component).
- Delete with confirmation modal.

## Phase 3  Scan / photo upload flow
- Obverse + reverse image upload (file input + preview).
- Attach images to coin record.
- Allow skipping photos.

## Phase 4  Value estimator + comparables
- Add comparable sales (ValueSource) to a coin.
- Compute low/mid/high estimate from comparables (transparent algorithm).
- Store confidence + notes.

## Phase 5  Archive & reports
- Export JSON (schema versioned).
- Export CSV (coin metadata).
- Printable report view.

## Phase 6  Learn + Auctions
- Static articles in-repo.
- Auctions source list + add link.

## Phase 7  Tests + polish
Minimum tests:
- Renders
- Add coin manual
- Upload images in scan workflow
- Edit/delete with confirmation
- Search/sort
- Add comparable + estimator computes
- Export JSON/CSV valid
- Empty states

Quality gates each phase:
- `npm run lint`
- `npm run test`
- `npm run build`

Commit discipline:
- Frequent, clear commits (feat/test/docs).
