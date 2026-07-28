import { test, expect } from './fixtures';
import { checkoutInfo } from '../test-data/users';

// This is the app's core revenue path: browse -> cart -> checkout -> order
// confirmation. If this breaks, the business breaks, so it gets its own
// end-to-end test independent of the smaller unit-style tests.

test.describe('End-to-end checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('standard_user can purchase multiple items successfully', { tag: '@smoke' }, async ({ page, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    const itemsToBuy = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

    await test.step('Add items to cart', async () => {
      for (const item of itemsToBuy) {
        await inventoryPage.addItemToCart(item);
      }
      expect(await inventoryPage.getCartItemCount()).toBe(itemsToBuy.length);
    });

    await test.step('Go to cart and verify contents', async () => {
      await inventoryPage.goToCart();
      await expect(page).toHaveURL(/cart\.html/);
      const namesInCart = await cartPage.getCartItemNames();
      expect(namesInCart.sort()).toEqual([...itemsToBuy].sort());
    });

    await test.step('Proceed through checkout', async () => {
      await cartPage.checkout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await checkoutStepOnePage.fillInfo(checkoutInfo.firstName, checkoutInfo.lastName, checkoutInfo.postalCode);
      await checkoutStepOnePage.continueToOverview();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Verify order summary math', async () => {
      const itemTotal = await checkoutStepTwoPage.getItemTotal();
      const tax = await checkoutStepTwoPage.getTax();
      const total = await checkoutStepTwoPage.getTotal();
      expect(total).toBeCloseTo(itemTotal + tax, 2);
    });

    await test.step('Finish order and verify confirmation', async () => {
      await checkoutStepTwoPage.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await checkoutCompletePage.expectOrderComplete();
    });
  });

  test('cannot proceed to checkout step two without required fields', { tag: '@regression' }, async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutStepOnePage.continueToOverview();
    await checkoutStepOnePage.expectValidationError('Error: First Name is required');
  });
});
