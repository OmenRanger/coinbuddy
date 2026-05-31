# Testing Plan

## Automated Checks

- `node --run lint`: syntax and basic project checks
- `node --run test`: Node unit tests for valuation, search, sort, storage helpers, and export output
- `node --run test:browser`: Playwright workflow test for add, scan image upload, edit, search, sort, comparable sale, export, and delete confirmation
- `node --run build`: static production copy to `dist/`

## Required MVP Behaviors

- App renders without crashing.
- User can add a coin manually.
- User can attach coin images in the scanner workflow.
- User can edit coin details.
- User can delete a coin after confirmation.
- User can search collection.
- User can sort collection.
- User can add comparable sale data.
- Value estimator calculates low, mid, and high range.
- Export functions create valid JSON and CSV.
- Empty states display correctly.
- Mobile layout remains usable.

## Manual QA

- Can the user open the app and know what to press?
- Can the user add a coin without help?
- Can the user find the collection?
- Can the user understand that value is an estimate?
- Can the user export records?
- Are there too many choices on any screen?

## Current Status

Completed on 2026-05-31:

- Lint passed: 15 JavaScript files and 11 required files.
- Unit tests passed: 8 passed, 0 failed.
- Browser workflow test passed.
- Build passed and produced `dist/`.
- In-app browser visual check passed with 0 console errors on the home screen.
