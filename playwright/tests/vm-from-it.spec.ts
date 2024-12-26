import { expect, test } from '@playwright/test';

import * as cView from '../views/selector';

const volName = 'rhel10-beta';
const vmName = 'test-vm';

test('create VM from InstanceType', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');

  await page.getByTestId(cView.virtNavItemID).click();
  await page.getByTestId(cView.catalogNavItemID).click();
  await page.locator(cView.volRowNameText).filter({ hasText: volName }).click();
  await page.getByTestId(cView.itVmNameID).fill(vmName);
  await expect(page.getByRole('button', { name: cView.createBtnText })).toBeEnabled({
    timeout: 30 * 1000,
  });
  await page.getByRole('button', { name: cView.createBtnText }).click();

  expect(page.getByTestId(cView.vmDetailsNameID)).toHaveText(vmName, { timeout: 20 * 1000 });
});
