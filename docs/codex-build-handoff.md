# Codex Build Handoff

## Checkpoint

- Repo: `OmenRanger/coinbuddy`
- Branch: `auto/hermes-codex-launch`
- Remote base observed before this handoff prep: `1a840fa`
- Earlier stable MVP checkpoint from prior Codex pass: `ce2757e`

## Local Run Command

```bash
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173`.

## Test And Build Commands

```bash
node scripts/lint.mjs
node --test src/tests/*.test.mjs
node scripts/browser-test.mjs
node scripts/build.mjs
```

## Implemented Features

- Mobile-first vintage Americana ledger UI shell.
- Home dashboard with main actions and collection summary.
- Manual coin entry with friendly fields and save confirmation.
- Scanner-style obverse/reverse image upload with previews.
- Local-first inventory CRUD in browser storage.
- My Collection search, sort, and filters.
- Coin detail page with images, archive metadata, edit, delete confirmation, and comparable sales.
- Manual value estimator with low, mid, high, confidence, source notes, and careful appraisal wording.
- Archive & Reports with JSON export, CSV export, and printable report view.
- Learn page with static beginner, storage, grading, fraud-awareness, and insurance-prep guidance.
- Auctions page with curated source links and user-added source links/watch state.
- Settings page with storage status, theme selection, export, and import.
- README, roadmap, product docs, testing plan, release checklist, and Obsidian-compatible vault notes.

## Intentionally Stubbed Or Manual

- Coin scanning is image upload plus manual confirmation, not automated identification.
- Value estimates are based on user-entered comparable sales, not live market APIs.
- Auction discovery is curated/user-added links, not scraping or live feed ingestion.
- Storage is local browser `localStorage`; Supabase/cloud sync is planned but not active.
- Receipt/document uploads, PDF reports, and professional appraisal workflows are future work.
- A Vite/React scaffold exists from the remote branch for possible migration, but the active runnable MVP currently uses the dependency-light static PWA entrypoint.

## Known Limitations

- Large photo collections may outgrow browser local storage.
- Estimates are not official appraisals or guaranteed sale prices.
- Coin grading and identification require human review or professional help.
- Browser workflow testing depends on Playwright/Chrome availability in the local environment.
- The app has not yet had Hermes' final product/docs/UX review pass merged.

## Files Hermes Should Review First

- `README.md`
- `docs/product-brief.md`
- `docs/ui-style-guide.md`
- `docs/mother-friendly-ux-checklist.md`
- `docs/storage-plan.md`
- `docs/testing-plan.md`
- `docs/codex-build-sequence.md`
- `docs/codex-build-handoff.md`
- `vault/CoinBuddy-Context.md`
- `src/app/main.js`
- `src/styles/styles.css`
- `docs/screenshots/home-desktop.png`

## Suggested Next Implementation Priorities

1. Merge Hermes' final UX/product notes and resolve wording or flow mismatches.
2. Decide whether to keep the static PWA for the first launch or migrate the active app to the Vite/React scaffold.
3. Add a PDF-style report export after the JSON/CSV archive path is accepted.
4. Improve scanner capture with camera constraints, cropping, and clearer front/back review.
5. Add safe cloud sync with Supabase only after security boundaries and RLS are documented.
6. Add permitted market-data integrations only after source legality and attribution are reviewed.

## Stability Notes

- Do not expose service-role keys or private credentials in client code.
- Keep exports portable and human-readable.
- Preserve manual fallbacks for every scanner or market-data workflow.
- Confirm destructive actions.
- Keep the home screen simple enough that the primary collector knows what to press first.
