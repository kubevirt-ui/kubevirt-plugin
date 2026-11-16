import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(
  `VM creation wizard entry ${ROUTE_VM_WIZARD_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`,
  () => {
    test('Tree namespace Create VirtualMachine opens wizard with all creation methods', async ({
      testNamespace,
      vmCreationWizardPage,
      vmListPage,
    }) => {
      await vmCreationWizardPage.openFromTreeNamespace(vmListPage, testNamespace);
      await expect(vmCreationWizardPage.page).toHaveURL(/\/vm-wizard/);
      await expect
        .poll(() => vmCreationWizardPage.verifyCreationMethodTilesVisible(), {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(true);
    });
  },
);
