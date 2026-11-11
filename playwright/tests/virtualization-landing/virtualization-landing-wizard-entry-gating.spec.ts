import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG, ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Overview VM wizard entry ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${ROUTE_VM_WIZARD_TAG} ${GATING_TAG}`, () => {
  test('From VirtualMachines list, tour Create opens the VM wizard', async ({
    vmCreationWizardPage,
    nav,
    testNamespace,
    vmListPage,
  }) => {
    await nav.goToVirtualMachines();
    await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
    await expect(vmCreationWizardPage.page).toHaveURL(/\/vm-wizard/);
    await expect
      .poll(() => vmCreationWizardPage.verifyCreationMethodTilesVisible(), {
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(true);
  });
});
