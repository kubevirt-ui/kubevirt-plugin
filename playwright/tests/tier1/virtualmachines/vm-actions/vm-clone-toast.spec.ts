import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-actions-fixture';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

type AlertVariant = 'danger' | 'info' | 'success';

const alertVariantSelector = (variant: AlertVariant): string =>
  `.pf-v6-c-alert.pf-m-${variant}, .pf-v5-c-alert.pf-m-${variant}, .pf-c-alert.pf-m-${variant}`;

const cloneToastTitle = (targetVmName: string): string => `Clone virtual machine - ${targetVmName}`;

const expectToastByVariant = (page: Page, variant: AlertVariant, targetVmName: string) => {
  const toast = page
    .locator(alertVariantSelector(variant))
    .filter({ hasText: cloneToastTitle(targetVmName) });
  return expect(toast).toBeVisible({ timeout: TestTimeouts.DEFAULT });
};

async function expectCloneModalOpen(page: Page): Promise<void> {
  const modal = page.getByTestId('dialog-modal').filter({ hasText: /Clone/i });
  await expect(modal).toBeVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
}

async function fillCloneFormAndSubmit(page: Page, targetVmName: string): Promise<void> {
  const nameInput = page.locator('input[id="name"], input[id="clone-name"]').first();
  await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  await nameInput.clear();
  await nameInput.fill(targetVmName);

  const startAfterCreate = page.locator('#start-clone');
  await startAfterCreate.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  if (!(await startAfterCreate.isChecked())) {
    await startAfterCreate.click({ force: true });
  }
  await expect(startAfterCreate).toBeChecked();

  const submitButton = page.getByTestId('save-button').filter({ hasText: 'Clone' });
  await expect(submitButton).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
  await submitButton.click();
}

test.describe(
  'VM clone toast notifications',
  { tag: [T1_TAG, '@tier1-vm-actions', '@vm-clone-toast'] },
  () => {
    test('Clone modal submit shows info toast, then terminal toast after clone finishes', async ({
      apiClient,
      page,
      utils,
      vmListPage,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: 'VM Clone',
        feature: T1,
        tags: [T1_TAG, '@tier1-vm-actions', '@vm-clone-toast'],
      });

      const ns = utils.generateTestNamespace('vm-clone-toast');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const sourceVm = utils.generateRandomVmName('clone-src');
      const targetVm = utils.generateRandomVmName('clone-target');

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        sourceVm,
        ns,
        'openshift',
        false,
      );

      apiClient.trackResource('VirtualMachine', sourceVm, ns);
      await apiClient.verifyVmCreated(sourceVm, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmListPage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await test.step('Open clone modal, enable start after creation, and submit', async () => {
        await vmListPage.clickVmRowAction(sourceVm, 'clone');
        await expectCloneModalOpen(page);
        await fillCloneFormAndSubmit(page, targetVm);
        await expectToastByVariant(page, 'info', targetVm);
      });

      await test.step('Cloned VM exists and toast notification', async () => {
        const { exists } = await apiClient.verifyVmCreated(
          targetVm,
          ns,
          utils.TestTimeouts.DEFAULT,
        );
        const variant = exists ? 'success' : 'danger';
        apiClient.trackResource('VirtualMachine', targetVm, ns);
        await expectToastByVariant(page, variant, targetVm);
      });
    });
  },
);
