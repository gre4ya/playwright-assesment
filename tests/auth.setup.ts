import { test as setup } from './fixtures';
import { users } from '../test-data/users';

const authFile = 'playwright/.auth/standard_user.json';

setup('authenticate as standard_user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);
  await page.waitForURL('**/inventory.html');
  await page.context().storageState({ path: authFile });
});