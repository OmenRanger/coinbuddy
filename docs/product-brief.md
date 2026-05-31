# CoinBuddy — Product Brief (MVP)

## One-line
CoinBuddy is a warm, trustworthy coin-collection companion that helps a non-technical collector photograph coins, track an inventory, keep proof-of-ownership records, and produce simple value estimates and exportable reports.

## Who it’s for
Primary user: Micah’s mother.

Design assumptions:
- Prefers obvious buttons and simple labels.
- Avoids technical menus/settings.
- Needs forgiving workflows, gentle guidance, and clear confirmation.
- Wants confidence and peace of mind (documentation/organization), not “power user” complexity.

## Goals
1. Make it effortless to add a coin (manual entry + photos).
2. Make it easy to find coins later (search/sort/filter).
3. Create an “archive” that feels like proof-of-ownership (insurance/estate prep friendly).
4. Provide transparent value estimates (ranges + sources + confidence), without implying appraisal certainty.
5. Keep data local-first and exportable.

## Non-goals (MVP)
- No claims of professional grading/appraisal.
- No scraping websites in violation of terms.
- No mandatory accounts, logins, or complex setup.
- No heavy AI identification promises; scanning starts as photo capture + manual confirmation.

## MVP Screens
- Home (5 obvious actions + summary)
- Scan Coin (photo upload/capture: obverse/reverse + manual confirm)
- Add Coin Manually (simple form)
- My Collection (grid/list + search + sort + filter)
- Coin Detail (view/edit, mark favorite/needs review, add comparable sale)
- Value Estimator (manual comparables → low/mid/high + confidence)
- Archive & Reports (summary + export JSON/CSV + printable report view)
- Learn (static educational articles)
- Auctions (saved sources + add link + placeholder watchlist)
- Settings (export/import, storage status, about)

## Data & Storage (MVP)
- Local-first storage in the browser (IndexedDB via a small wrapper).
- Images stored as compressed blobs (or object URLs persisted as blobs).
- Exports include coin metadata + value sources + timestamps.

## Safety & accuracy language
- Always use: “possible match”, “estimate”, “range”, “confidence”, “not official appraisal”.
- Add a visible disclaimer on valuation-related screens and exports.

## Definition of done (working MVP)
- App launches reliably.
- User can add a coin (manual) with optional photos.
- Coin appears in collection; user can search/sort/filter.
- Coin detail supports edit + delete (with confirmation).
- User can add comparable sale entries and see estimate range.
- Exports produce valid JSON + CSV.
- Learn and Auctions sections exist with helpful starter content.
- Tests pass; build passes.

## Future extensions (post-MVP)
- Supabase sync/backup (optional), multi-device.
- Better photo capture UX, cropping, background cleanup.
- Assisted identification (carefully framed; user confirms).
- Permitted market data integrations (APIs/RSS).
- Receipt/document uploads.
- “Insurance packet” export (PDF) with selected coins.
