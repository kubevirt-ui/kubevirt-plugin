import { T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';

test.describe(`VM wizard deployment validation ${ROUTE_VM_WIZARD_TAG} ${T1_TAG}`, () => {
  test('Custom configuration requires a generated name before Next', async ({
    testNamespace,
    vmCreationWizardPage,
    vmListPage,
  }) => {
    await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.clearVmName();
    await expect(await vmCreationWizardPage.isNextButtonDisabled()).toBe(true);
    await vmCreationWizardPage.generateVmName();
    await expect(await vmCreationWizardPage.isNextButtonDisabled()).toBe(false);
    await vmCreationWizardPage.clickCancel();
  });
});
