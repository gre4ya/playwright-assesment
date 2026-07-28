import { test, expect } from './fixtures';

// Cart correctness is critical: an inflated, missing, or stale cart directly
// causes wrong orders and lost revenue. This covers add/remove and makes sure
// state survives navigation between pages.

test.describe('Cart management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('adding an item updates the cart badge and button label', { tag: '@regression' }, async ({ page, inventoryPage }) => {

    expect(await inventoryPage.getCartItemCount()).toBe(0);

    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartItemCount()).toBe(1);

    // button should now read "Remove" for that item
    await expect(
      page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' }).locator('button')
    ).toHaveText('Remove');
  });

  test('removing an item from the inventory page updates the badge', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    expect(await inventoryPage.getCartItemCount()).toBe(2);

    await inventoryPage.removeItemFromCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartItemCount()).toBe(1);
  });

  test('removing an item from the cart page updates the badge and list', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();

    expect(await cartPage.getCartItemCountOnPage()).toBe(2);

    await cartPage.removeItem('Sauce Labs Backpack');

    expect(await cartPage.getCartItemCountOnPage()).toBe(1);
    expect(await cartPage.getCartItemCount()).toBe(1);
    const remainingNames = await cartPage.getCartItemNames();
    expect(remainingNames).toEqual(['Sauce Labs Bike Light']);
  });

  test('cart contents persist when navigating away and back', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    expect(await inventoryPage.getCartItemCount()).toBe(1);
  });

  test('reset app state empties the cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartItemCount()).toBe(1);

    await inventoryPage.resetAppState();
    expect(await inventoryPage.getCartItemCount()).toBe(0);
  });
});
