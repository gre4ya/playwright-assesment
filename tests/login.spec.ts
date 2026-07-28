import { test, expect } from './fixtures';
import { usersExpectingSuccess, usersExpectingError } from '../test-data/users';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  for (const user of usersExpectingSuccess) {
    test(`${user.username} can log in successfully — ${user.description}`, { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await loginPage.expectLoginSuccess();
      await expect(inventoryPage.inventoryList).toBeVisible();
    });
  }

  for (const user of usersExpectingError) {
    test(`${user.username} is blocked with correct error message`, { tag: '@regression' }, async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await loginPage.expectLoginError(user.expectedError!);
      // still on login page
      await expect(page).toHaveURL('https://www.saucedemo.com/');
    });
  }

  test('shows an error when username is missing', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.passwordInput.fill('secret_sauce');
    await loginPage.loginButton.click();
    await loginPage.expectLoginError('Epic sadface: Username is required');
  });

  test('shows an error when password is missing', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.loginButton.click();
    await loginPage.expectLoginError('Epic sadface: Password is required');
  });

  test('shows an error for invalid credentials', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');
    await loginPage.expectLoginError(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });
});
