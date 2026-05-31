# Codex Build Sequence

Branch: `auto/hermes-codex-launch`

## Phase 0: Repo Setup

1. Create the standalone CoinBuddy project.
2. Add the ledger palette, app shell, and route skeletons.
3. Add pages for Home, Scan Coin, Add Coin, My Collection, Coin Detail, Value Estimate, Archive & Reports, Learn, Auctions, and Settings.
4. Keep the app mobile-first and mother-friendly.

## Phase 1: First Working Flow

Home to Add Coin Manually to Save Coin to My Collection to Coin Detail.

Requirements:

- Implement the Coin type and local storage service.
- Implement the Add Coin form with minimal required fields.
- Show a save success message.
- Render collection cards.
- Open a useful coin detail record.

## Phase 2: Edit And Delete

- Reuse the coin form for edits.
- Confirm before deleting a coin.

## Phase 3: Scanner And Photo Upload

- Add obverse and reverse image upload.
- Preview selected images.
- Save images to the coin record for the MVP.
- Allow the user to continue if photos are skipped.

## Phase 4: Value Estimator

- Add comparable sales to a coin.
- Compute low, mid, and high estimates.
- Store confidence level and source notes.
- Avoid appraisal certainty.

## Phase 5: Archive And Reports

- Export JSON.
- Export CSV.
- Show a printable report view.
- Include careful insurance-prep wording.

## Phase 6: Learn And Auctions

- Add static education articles.
- Add curated auction/source links.
- Let the user add source links manually.

## Phase 7: Tests And Polish

Quality gates:

- Lint passes.
- Unit tests pass.
- Browser workflow test passes.
- Build passes.
- Home screen remains obvious on mobile.
