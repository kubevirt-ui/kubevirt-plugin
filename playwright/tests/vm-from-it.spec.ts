import { expect, test } from '@playwright/test';

import * as cView from '../views/selector';

const volName = 'rhel10-beta';
const vmName = 'test-vm';

test('create VM from InstanceType', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByTestId(cView.virtNavItemID).click();
  await page.getByTestId(cView.catalogNavItemID).click();
  await page.locator(cView.volRowNameText).filter({ hasText: volName }).click();
  await page.getByTestId(cView.itVmNameID).fill(vmName);
  await expect(page.getByRole('button', { name: cView.createBtnText })).toBeEnabled({
    timeout: 30 * 1000,
  });
  await page.getByRole('button', { name: cView.createBtnText }).click();

  const createVM = await page.waitForSelector(
    cView.waitForSelectorDataTestId(cView.vmDetailsNameID),
  );
  const createVMName = await createVM.textContent();

  expect(createVMName).toContain(vmName);
});
