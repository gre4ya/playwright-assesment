# Saucedemo Playwright Test Suite

Page Object Model test suite for [saucedemo.com](https://www.saucedemo.com), written in Playwright + TypeScript.

## Setup

```bash
npm install
npx playwright install
```

## Run tests

```bash
npm test              # headless, all browsers
npm run test:headed   # see the browser
npm run test:ui       # interactive UI mode
npm run report        # view last HTML report
```

## Structure

```
pages/
  BasePage.ts               shared nav (burger menu, cart badge, logout)
  LoginPage.ts
  InventoryPage.ts          product list, add/remove, sorting
  CartPage.ts
  CheckoutStepOnePage.ts     customer info form
  CheckoutStepTwoPage.ts     order overview / totals
  CheckoutCompletePage.ts

test-data/
  users.ts                  all 6 saucedemo users + checkout fixture data

tests/
  login.spec.ts              data-driven login for all users, + validation errors
  checkout-flow.spec.ts       full purchase flow (critical revenue path)
  cart-management.spec.ts     add/remove, badge accuracy, persistence, reset
  product-sorting.spec.ts     name/price sort correctness
```

## Why these 4 test files

1. **Login** — entry point for every other flow; also the only place that
   exercises all 6 special-behavior users (locked out, problem, performance
   glitch, error, visual) via `expectedError` data.
2. **Checkout flow** — the core money-making path. Covers happy path plus a
   required-field validation guard.
3. **Cart management** — cart state bugs (wrong count, stale items, items
   lost on navigation) are high-impact and easy to miss with only a login +
   checkout test.
4. **Product sorting** — a common source of silent bugs (string vs. numeric
   sort order) that a "page loads without erroring" test wouldn't catch.

## Notes

- `problem_user` is known to have broken product images/UI on saucedemo;
  if you extend visual assertions, expect some flakiness with that user.
- `performance_glitch_user` has an intentional delay on login — tes4ts
  involving it may need a longer timeout.
- Credentials are hardcoded here since saucedemo is a public demo app with
  no real security concerns. For a real app, move these to environment
  variables or a secrets manager instead.

## To Do / Future Improvements

If I had more time, I'd prioritize:

### Test Coverage
- [✅] API-level setup — log in via request context / storageState instead of UI, to speed up tests that don't need to test login itself
- [ ] `error_user` checkout flow — this user is known to break mid-checkout; worth a dedicated negative test
- [ ] `performance_glitch_user` — assert against a reasonable load-time threshold rather than just logging in successfully
- [ ] Cross-item checkout math — verify tax/total correctness across different item combinations, not just the happy-path set

### Infrastructure
- [ ] CI pipeline (GitHub Actions) running the suite on push/PR, across all 3 browser projects
- [ ] Parallel sharding in CI for faster feedback
- [ ] Environment-based config (dev/staging/prod base URLs via `.env` + `dotenv`)

### Code Quality
- [ ] Tags/annotations (`@smoke`, `@regression`) to allow running subsets via `--grep`
- [ ] Custom fixtures to auto-inject page objects
- [ ] ESLint + Prettier with a Playwright-specific ruleset

### Reporting
- [ ] Slack/email notification on CI failure
- [ ] Flaky test detection/retry reporting dashboard  
