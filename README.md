# Saucedemo Playwright Test Suite

Page Object Model test suite for [saucedemo.com](https://www.saucedemo.com), written in Playwright + TypeScript.

## Setup

```bash
npm install
npx playwright install
```

## Run tests

```bash
npm test                # headless, all browsers
npm run test:headed     # see the browser
npm run test:ui         # interactive UI mode
npm run test:smoke      # @smoke only — fast, critical-path
npm run test:regression # @regression only — full edge-case coverage
npm run report          # view last HTML report
```

## Structure

```
pages/
  BasePage.ts               shared nav (burger menu, cart badge, logout)
  LoginPage.ts
  InventoryPage.ts          product list, add/remove, sorting
  CartPage.ts
  CheckoutStepOnePage.ts    customer info form
  CheckoutStepTwoPage.ts    order overview / totals
  CheckoutCompletePage.ts

test-data/
  users.ts                  all 6 saucedemo users + checkout fixture data

tests/
  auth.setup.ts              logs in once as standard_user, saves storageState
  fixtures.ts                custom test fixture — auto-injects page objects
  login.spec.ts              data-driven login for all users, + validation errors
  checkout-flow.spec.ts      full purchase flow (critical revenue path)
  cart-management.spec.ts    add/remove, badge accuracy, persistence, reset
  product-sorting.spec.ts    name/price sort correctness
  .github/workflows/         CI: sharded run across all 3 browsers
  playwright.yml
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

## Authentication strategy
  saucedemo has no real login API — auth is handled entirely client-side in JS, 
  so there's no endpoint to hit with a request context. Instead, tests/auth.setup.ts 
  runs as a Playwright setup project: it logs in once via the UI as standard_user 
  and saves the session to playwright/.auth/standard_user.json via storageState. 
  Every browser project (chromium, firefox, webkit) declares a dependencies: ['setup'] 
  on this and loads that saved state, so checkout-flow, cart-management, and 
  product-sorting specs start already logged in — no repeated UI login per test.
  login.spec.ts opts back out with test.use({ storageState: { cookies: [], origins: [] } }) 
  since it needs a logged-out browser to actually exercise the login form.
  playwright/.auth/ is gitignored — it's regenerated on every run, not committed.
  
## Custom fixtures
  tests/fixtures.ts extends Playwright's base test to auto-construct and inject 
  every page object (loginPage, inventoryPage, cartPage, checkoutStepOnePage, 
  checkoutStepTwoPage, checkoutCompletePage) as fixtures. Specs import test/expect 
  from ./fixtures instead of @playwright/test, and just destructure the page objects 
  they need as test arguments — no manual new LoginPage(page) boilerplate, 
  and fixtures are lazily constructed so a test only pays for the page objects it actually uses.
  
## Tags
  Tests are tagged @smoke (fast, critical-path — logs in, happy-path checkout, basic cart add) 
  or @regression (everything else — all 6 special-behavior users, validation errors, 
  cart edge cases, sort order). Run a subset with:
  
  ```bash
  npx playwright test --grep @smoke
  npx playwright test --grep @regression
  ```

## CI/CD
  .github/workflows/playwright.yml runs on every push/PR to main:
  Sharded across 3 jobs (--shard=N/3) for faster feedback as the suite grows; 
  each shard runs all 3 browser projects for its slice of tests.
  Reporter is blob in CI (html locally) so per-shard results can be merged; 
  a separate merge-reports job downloads all shard blobs and produces one combined HTML report, 
  uploaded as the playwright-report artifact.
  To view a CI report locally after downloading the playwright-report artifact:
  
  ```bash
  npx playwright show-report ./playwright-report
  ```

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
- [ ] `error_user` checkout flow — this user is known to break mid-checkout; worth a dedicated negative test
- [ ] `performance_glitch_user` — assert against a reasonable load-time threshold rather than just logging in successfully
- [ ] Cross-item checkout math — verify tax/total correctness across different item combinations, not just the happy-path set

### Infrastructure
- [ ] Environment-based config (dev/staging/prod base URLs via `.env` + `dotenv`)

### Code Quality
- [ ] ESLint + Prettier with a Playwright-specific ruleset

### Reporting
- [ ] Slack/email notification on CI failure
- [ ] Flaky test detection/retry reporting dashboard  

#### Done
- [✅] API-level setup — log in via request context / storageState instead of UI, to speed up tests that don't need to test login itself
- [✅] CI pipeline (GitHub Actions) running the suite on push/PR, across all 3 browser projects
- [✅] Parallel sharding in CI for faster feedback
- [✅] Tags/annotations (`@smoke`, `@regression`) to allow running subsets via `--grep`
- [✅] Custom fixtures to auto-inject page objects
