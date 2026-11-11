import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM wizard method selection — clone ${ROUTE_VM_WIZARD_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  // Gating: clone method → Source step with Next disabled. Selecting a source VM (and
  // enabling Next) is covered in longer creation flows — project filter menuitems under
  // parallel workers can navigate off /vm-wizard.
  test('Clone existing VirtualMachine opens source step with Next disabled', async ({
    testNamespace,
    vmCreationWizardPage,
    vmListPage,
  }) => {
    await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
    await vmCreationWizardPage.selectCreationMethod('cloneVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    await expect
      .poll(
        async () => {
          await vmCreationWizardPage.expectWizardVisible();
          return vmCreationWizardPage.verifyCloneSourceStepVisible();
        },
        {
          timeout: TestTimeouts.LONG_OPERATION,
        },
      )
      .toBe(true);
    await expect(await vmCreationWizardPage.isNextButtonDisabled()).toBe(true);
    await vmCreationWizardPage.clickCancel();
  });
});
