import path from 'path';

import { expect, test } from '@playwright/test';

const authFile = path.join(__dirname, '../.auth/user.json');

test('Login web console', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('');

  const loginHead = page.getByRole('heading', { name: 'Log in with' });
  if (await loginHead.isVisible()) {
    await page.getByRole('heading', { name: 'Log in with' }).click();
    await page.getByTitle('Log in with kube:admin').click();
  }
  await page.getByLabel('Username').fill('kubeadmin');
  await page.getByLabel('Password').fill(process.env.BRIDGE_KUBEADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('You are logged in as a temporary administrative user.')).toBeVisible(
    { timeout: 60 * 1000 },
  );

  await page.context().storageState({ path: authFile });
});
