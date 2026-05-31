# CoinBuddy Storage Plan (MVP)

## Principles
- Local-first: works without accounts or configuration.
- Exportable: user can always export JSON/CSV for insurance/estate documentation.
- Safe by default: no server-side secrets in client code.
- Upgrade path: later add optional Supabase sync/backup.

## MVP storage approach
### Data
- Store structured app data (coins, value sources, reports, settings) in IndexedDB.
- Keep schema versioned (simple migration strategy).

### Images
- Store obverse/reverse photos as blobs in IndexedDB.
- Generate thumbnails for fast list rendering.
- Keep original + thumbnail if feasible; otherwise store compressed versions.

### Backups / restore
- Export JSON:
  - Includes all coins, value sources, reports, timestamps, and settings.
  - Includes images as base64 (optional toggle) or as separate downloadable files if size becomes an issue.
- Export CSV:
  - Coin metadata only (no images). Good for spreadsheets/insurance lists.
- Import JSON:
  - Validates schema version.
  - Restores coins and images.

## Privacy & security notes
- MVP keeps data on-device.
- Provide a Settings note: clearing browser storage will remove data unless exported.
- Recommend periodic exports for backup.

## Optional future: Supabase sync (post-MVP)
- Use only SUPABASE_URL + public anon key in client.
- Never include SUPABASE_SERVICE_ROLE_KEY in client code.
- Consider an opt-in Cloud Backup toggle with clear explanation.
- Storage: Supabase Storage bucket for coin images; Postgres for metadata.

## Data model anchors
- Coin
- ValueSource
- CollectionReport

(See docs/data-model.md for the canonical types once implemented.)
