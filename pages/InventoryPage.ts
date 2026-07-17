import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.inventoryItemNames = page.locator('.inventory_item_name');
    this.inventoryItemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  private addButtonFor(itemName: string): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ hasText: itemName })
      .locator('button', { hasText: 'Add to cart' });
  }

  private removeButtonFor(itemName: string): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ hasText: itemName })
      .locator('button', { hasText: 'Remove' });
  }

  async addItemToCart(itemName: string) {
    await this.addButtonFor(itemName).click();
  }

  async removeItemFromCart(itemName: string) {
    await this.removeButtonFor(itemName).click();
  }

  async addItemToCartByIndex(index: number) {
    await this.inventoryItems.nth(index).locator('button', { hasText: 'Add to cart' }).click();
  }

  async getItemNames(): Promise<string[]> {
    return this.inventoryItemNames.allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItemPrices.allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    const valueMap = {
      az: 'az',
      za: 'za',
      lohi: 'lohi',
      hilo: 'hilo',
    };
    await this.sortDropdown.selectOption(valueMap[option]);
  }

  async clickItemTitle(itemName: string) {
    await this.page.locator('.inventory_item_name', { hasText: itemName }).click();
  }
}
