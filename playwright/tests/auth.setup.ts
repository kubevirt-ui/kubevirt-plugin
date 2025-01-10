import path from 'path';

import { expect, test } from '@playwright/test';

test('Login web console', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const loginHead = page.getByRole('heading', { name: 'Log in with' });

  if (await loginHead.isVisible()) {
    await page.getByRole('heading', { name: 'Log in with' }).click();
    await page.getByTitle('Log in with kube:admin').click();
    await page.getByLabel('Username').fill('kubeadmin');
    await page.getByLabel('Password').fill(process.env?.BRIDGE_KUBEADMIN_PASSWORD ?? '');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(
      page.getByText('You are logged in as a temporary administrative user.'),
    ).toBeVisible({ timeout: 60 * 1000 });

    await page.context().storageState({ path: path.join(__dirname, '../.auth/user.json') });
  }
});
