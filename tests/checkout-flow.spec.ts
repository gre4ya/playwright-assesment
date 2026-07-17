import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { users, checkoutInfo } from '../test-data/users';

// This is the app's core revenue path: browse -> cart -> checkout -> order
// confirmation. If this breaks, the business breaks, so it gets its own
// end-to-end test independent of the smaller unit-style tests.

test.describe('End-to-end checkout flow', () => {
  test('standard_user can purchase multiple items successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const stepOne = new CheckoutStepOnePage(page);
    const stepTwo = new CheckoutStepTwoPage(page);
    const complete = new CheckoutCompletePage(page);

    const itemsToBuy = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

    await test.step('Log in', async () => {
      await loginPage.goto();
      await loginPage.login(users.standard.username, users.standard.password);
      await loginPage.expectLoginSuccess();
    });

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
      await stepOne.fillInfo(checkoutInfo.firstName, checkoutInfo.lastName, checkoutInfo.postalCode);
      await stepOne.continueToOverview();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Verify order summary math', async () => {
      const itemTotal = await stepTwo.getItemTotal();
      const tax = await stepTwo.getTax();
      const total = await stepTwo.getTotal();
      expect(total).toBeCloseTo(itemTotal + tax, 2);
    });

    await test.step('Finish order and verify confirmation', async () => {
      await stepTwo.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await complete.expectOrderComplete();
    });
  });

  test('cannot proceed to checkout step two without required fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const stepOne = new CheckoutStepOnePage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await stepOne.continueToOverview();
    await stepOne.expectValidationError('Error: First Name is required');
  });
});
