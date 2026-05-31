# CoinBuddy phone beta / family test (NOT final release)

Status label: **CoinBuddy phone beta / family test**

This checkpoint is meant for a supervised beta on a family member’s phone.
It is not a final release.

## Safety notes (what this beta is / is not)
- Local-first: coins are stored on-device in IndexedDB.
- Deleting a coin deletes it from that device.
- Exports (JSON) may include photo data and can become large.
- Value ranges are for personal documentation and research support only (not an appraisal).

## Pre-flight (developer)
- Confirm you’re on branch `auto/hermes-codex-launch`.
- Ensure the latest commit is `f4a26a4` or newer.
- Ensure `b07883a` remains included in HEAD.

## Phone beta checklist (run on your mother’s phone)

### A) Open / install
- [ ] App opens in mobile Safari/Chrome without layout breakage.
- [ ] Text is readable (no tiny fonts).
- [ ] Buttons are easy to tap (no tiny icon-only actions).
- [ ] If using “Add to Home Screen” (PWA), it installs and opens.
- [ ] If not installing, the staging URL opens cleanly and is easy to bookmark.

### B) Core flows
- [ ] Add coin manually works (Save → shows in My Collection).
- [ ] Scanner / image upload works:
  - [ ] Front photo upload works.
  - [ ] Back photo upload works.
  - [ ] Front/back photo previews appear.
  - [ ] Removing/replacing a photo works.
- [ ] Saved coin persists after closing and reopening the browser.
- [ ] Coin detail page shows photos (or clear placeholders if missing).
- [ ] Edit coin details preserves existing photos when no new photos are chosen.
- [ ] Delete confirmation is clear and forgiving.

### C) Collection browsing
- [ ] Search works.
- [ ] Sort works.
- [ ] Filters work (including “missing photos” / needs review, etc.).

### D) Archive & reports
- [ ] Archive summary loads and looks correct.
- [ ] Export JSON downloads successfully.
- [ ] Export CSV downloads successfully.
- [ ] Printable report page renders and “Print Report” opens the print dialog.

### E) Value estimate (manual sale examples)
- [ ] Coin detail shows “Estimated market range” section.
- [ ] User can add a sale example (observed price + source name).
- [ ] User can edit a sale example.
- [ ] User can remove a sale example.
- [ ] Estimate updates after adding/removing examples.
- [ ] “This is not an appraisal” disclaimer is visible and understandable.

### F) Content quality / UX
- [ ] No mojibake (weird quotes/symbols) or broken copy.
- [ ] Labels are plain language (no developer jargon).
- [ ] Empty states are helpful (not scary or confusing).
- [ ] Success messages appear after saving.

## Known environment limitation
- Automated Playwright browser tests are blocked in this Ubuntu 26.04 WSL environment (Chromium install unsupported). This is an environment limitation, not an app failure.

## Recommended supervised beta deployment options

### Option 1 (fastest): local LAN dev server (same Wi‑Fi)
From the project root:
- `npm run react:dev -- --host 0.0.0.0 --port 5173`
Then open the shown network URL (your computer’s LAN IP) on the phone, e.g.:
- `http://<YOUR_LAN_IP>:5173/`

Notes:
- Phone and your computer must be on the same Wi‑Fi.
- Works well for a supervised session.

### Option 2: local build + preview server (same Wi‑Fi)
- `npm run react:build`
- `npx vite preview --host 0.0.0.0 --port 4173`
Open on phone:
- `http://<YOUR_LAN_IP>:4173/`

### Option 3: staging deployment (recommended for remote / repeat testing)
Deploy the React build to a staging host (Netlify/Vercel/GitHub Pages). Use a staging URL and do NOT label it “final release”.

Suggested approach:
- Vercel preview deployment from branch `auto/hermes-codex-launch`, or
- Netlify deploy previews from the same branch.

When a staging URL exists, record it here:
- Staging URL: ______________________________
