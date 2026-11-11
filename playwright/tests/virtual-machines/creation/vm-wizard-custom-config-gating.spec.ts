import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM wizard Custom configuration ${ROUTE_VM_WIZARD_TAG} ${GATING_TAG}`, () => {
  test('Custom configuration reaches Review and create', async ({
    testNamespace,
    vmCreationWizardPage,
    vmListPage,
  }) => {
    await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
    await vmCreationWizardPage.advanceCustomConfigurationToReview();
    await expect
      .poll(() => vmCreationWizardPage.verifyReviewStepVisible(), {
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(true);
    await vmCreationWizardPage.clickCancel();
  });
});
