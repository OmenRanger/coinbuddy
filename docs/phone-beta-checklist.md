# CoinBuddy Phone Beta / Family Test

This is a supervised phone beta checkpoint, not a final release.

## Branch Check

- Active branch reviewed: `auto/hermes-codex-launch`
- Latest active commit reviewed: `d78fd1f` (`feat: migrate React comparable sales and value estimator`)
- Required minimum commit: `f4a26a4` or newer
- Result: `d78fd1f` is newer than `f4a26a4`
- Original Codex checkpoint: `b07883a` remains included

## Readiness Summary

Phone beta readiness for the current React/Vite app: **No, not yet.**

The current branch is close enough for a supervised beta plan, but it should not be put on a phone as the React/Vite beta until the blockers below are resolved.

### Blockers Before Mom's Phone

1. `npm` is not available in this local environment, so the requested React/Vite build and Vitest commands could not be verified here.
2. The root `index.html` still loads the static MVP entrypoint, `src/app/main.js`, not the React entrypoint, `src/main.tsx`. A normal browser/staging URL may therefore test the static MVP instead of the migrated React/Vite app.
3. Visible mojibake remains in React UI copy, including corrupted apostrophes, arrows, and quoted text in scanner, coin detail, collection/value labels, and loading states.
4. Learn, Auctions, and Settings still appear to be placeholder React pages. Keep the beta label narrow and supervised.

## Verification Commands

Requested commands:

```bash
npm run lint
npm run test
npm run build
npm run react:build
npm run react:test
```

Local result: all five requested `npm run ...` commands failed before execution because `npm` is not recognized on PATH and `node_modules` is absent.

Available direct checks with the bundled Node runtime:

```bash
node scripts/lint.mjs
node --test src/tests/*.test.mjs
node scripts/browser-test.mjs
node scripts/build.mjs
```

Direct-check result:

- Static lint passed.
- Static Node tests passed: 8/8.
- Browser workflow test passed.
- Static build completed and wrote `dist/`.

React-specific build/test status:

- `npm run react:build`: not verified locally.
- `npm run react:test`: not verified locally.

## Phone Beta Manual Checklist

Use this as the supervised family-test pass once a React/Vite staging URL is available.

- [ ] App opens on phone.
- [ ] Add to home screen works, or staging URL opens cleanly in the phone browser.
- [ ] Add coin manually works.
- [ ] Scanner/image upload works.
- [ ] Front/back photo previews work.
- [ ] Saved coin persists after closing and reopening the browser.
- [ ] Coin detail shows saved photos.
- [ ] Edit preserves photos.
- [ ] Delete confirmation works and is hard to tap by accident.
- [ ] Search, sort, filter, and reset work.
- [ ] Missing-photo filter still works.
- [ ] Comparable sale entry works if included in this beta.
- [ ] Estimated market range updates from saved sale examples if included in this beta.
- [ ] Archive JSON export works on the phone browser.
- [ ] CSV export works on the phone browser.
- [ ] Printable report page renders.
- [ ] Browser print/share/save behavior is understandable on the target phone.
- [ ] No visible mojibake or broken copy.
- [ ] No confusing labels for a non-technical user.
- [ ] Disclaimers are visible near value estimates, archive/export, grading, insurance, and market-data language.
- [ ] Learn, Auctions, and Settings are either migrated or clearly out of scope for this phone beta.

## Recommended Staging Method

Preferred staging path:

1. Ensure the React/Vite entrypoint is actually what staging serves. Root HTML should mount `src/main.tsx` into a `#root` element, or Hermes should provide a separate beta HTML/route that clearly serves the React app.
2. Install dependencies in an environment with npm:

```bash
npm ci
```

3. Run full verification:

```bash
npm run lint
npm run test
npm run build
npm run react:build
npm run react:test
```

4. Deploy a temporary preview from the branch to Vercel, Netlify, Cloudflare Pages, or another HTTPS preview host.

Use HTTPS preview hosting for the actual family test if possible. It avoids local Wi-Fi/firewall issues and better matches how a phone user will open the app.

## Local Phone Test Command

If testing from the same Wi-Fi network after dependencies are installed and the React entrypoint is wired:

```bash
npm run react:dev -- --host 0.0.0.0 --port 5173
```

Then open this on the phone:

```text
http://192.168.1.162:5173/
```

This local URL depends on the current computer staying on Wi-Fi at `192.168.1.162`. If the IP changes, use the `Network` URL printed by Vite.

## Do Not Call This Final Release

This checkpoint is only for **CoinBuddy phone beta / family test**. Do not update README or release copy to final-release language yet. React/Vite still needs final parity review, especially Learn, Auctions, Settings, phone UX, visible copy cleanup, and staging/build verification.
