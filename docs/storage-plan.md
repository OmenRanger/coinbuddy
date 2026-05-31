# Storage Plan

## MVP

CoinBuddy stores data in browser `localStorage`.

Stored collections:

- `coinbuddy.coins.v1`: coin inventory records
- `coinbuddy.auctionSources.v1`: user-added auction/source links
- `coinbuddy.theme.v1`: theme choice

Images are stored as data URLs in coin records. This keeps the MVP simple, but it is not the right long-term archive for a large photo collection.

## Export And Portability

The app supports JSON export for full backup and CSV export for spreadsheet-friendly insurance-prep records.

## Future Supabase Path

Recommended future tables:

- `coins`
- `coin_images`
- `value_sources`
- `reports`
- `auction_sources`
- `attachments`

Recommended storage buckets:

- `coin-images`
- `receipts`
- `reports`

Security requirements:

- Use only public anon keys in client code.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in a Vite or client variable.
- Add row-level security before production sync.
- Keep local export/import available even after cloud sync.

## Backup Guidance

For the MVP, users should export JSON after meaningful collection updates. Future versions should add backup reminders and optional cloud sync.
