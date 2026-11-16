import { T1_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(
  `VM wizard method selection — template ${ROUTE_VM_WIZARD_TAG} ${T1_TAG} ${NON_PRIV_TAG}`,
  () => {
    test('Create from Template enables template catalog step', async ({
      testNamespace,
      vmCreationWizardPage,
      vmListPage,
    }) => {
      await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
      await vmCreationWizardPage.selectCreationMethod('fromTemplate');
      await vmCreationWizardPage.ensureVmNameFilled();
      await vmCreationWizardPage.clickNext();
      await expect
        .poll(() => vmCreationWizardPage.verifyTemplateCatalogStepVisible(), {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(true);
      await vmCreationWizardPage.clickCancel();
    });
  },
);
