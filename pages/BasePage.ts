import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly appLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
    this.cartIcon = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.appLogo = page.locator('.app_logo');
  }

  async openBurgerMenu() {
    await this.burgerMenuButton.click();
  }

  async logout() {
    await this.openBurgerMenu();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.openBurgerMenu();
    await this.resetAppStateLink.click();
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async getCartItemCount(): Promise<number> {
    if (await this.cartBadge.count() === 0) {
      return 0;
    }
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }
}
