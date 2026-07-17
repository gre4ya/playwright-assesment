import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { usersExpectingSuccess, usersExpectingError } from '../test-data/users';

test.describe('Login', () => {
  for (const user of usersExpectingSuccess) {
    test(`${user.username} can log in successfully — ${user.description}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await loginPage.expectLoginSuccess();
      await expect(inventoryPage.inventoryList).toBeVisible();
    });
  }

  for (const user of usersExpectingError) {
    test(`${user.username} is blocked with correct error message`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await loginPage.expectLoginError(user.expectedError!);
      // still on login page
      await expect(page).toHaveURL('https://www.saucedemo.com/');
    });
  }

  test('shows an error when username is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.passwordInput.fill('secret_sauce');
    await loginPage.loginButton.click();
    await loginPage.expectLoginError('Epic sadface: Username is required');
  });

  test('shows an error when password is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.loginButton.click();
    await loginPage.expectLoginError('Epic sadface: Password is required');
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');
    await loginPage.expectLoginError(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });
});
