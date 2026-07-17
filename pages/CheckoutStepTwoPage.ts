import { Page, Locator } from '@playwright/test';

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('#finish');
    this.cancelButton = page.locator('#cancel');
  }

  async goto() {
    await this.page.goto('/checkout-step-two.html');
  }

  private async parseLabelAmount(locator: Locator): Promise<number> {
    const text = (await locator.textContent()) ?? '';
    const match = text.match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : NaN;
  }

  async getItemTotal(): Promise<number> {
    return this.parseLabelAmount(this.itemTotalLabel);
  }

  async getTax(): Promise<number> {
    return this.parseLabelAmount(this.taxLabel);
  }

  async getTotal(): Promise<number> {
    return this.parseLabelAmount(this.totalLabel);
  }

  async finish() {
    await this.finishButton.click();
  }
}
