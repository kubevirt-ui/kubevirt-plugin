import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM wizard Clone existing VirtualMachine ${ROUTE_VM_WIZARD_TAG} ${T2_TAG}`, () => {
  test('Clone flow selects API-seeded source VM and creates a clone', async ({
    apiClient,
    testNamespace,
    vmCreationWizardPage,
    vmListPage,
  }) => {
    const sourceName = generateNameWithBase(`${CRUD_NAMES.vmExample}-clone-src`, 50);

    await apiClient.deleteVirtualMachine(sourceName, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, sourceName);
    await expect
      .poll(() => apiClient.virtualMachineExists(sourceName, testNamespace), {
        message: `source VM ${testNamespace}/${sourceName} should exist`,
        timeout: TestTimeouts.VM_CREATION,
      })
      .toBe(true);

    let cloneName = '';

    try {
      await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
      await vmCreationWizardPage.advanceCloneSourceToReview(sourceName, testNamespace);
      await expect
        .poll(() => vmCreationWizardPage.verifyReviewStepVisible(), {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(true);
      await vmCreationWizardPage.clickCreateVirtualMachine();
      await expect
        .poll(async () => (await vmCreationWizardPage.getCreatedVmNameFromUrl()).length, {
          message: 'Clone create should navigate to the new VirtualMachine',
          timeout: TestTimeouts.VM_CREATION,
        })
        .toBeGreaterThan(0);
      cloneName = await vmCreationWizardPage.getCreatedVmNameFromUrl();
      await expect
        .poll(() => apiClient.virtualMachineExists(cloneName, testNamespace), {
          message: `clone VM ${testNamespace}/${cloneName} should exist`,
          timeout: TestTimeouts.VM_CREATION,
        })
        .toBe(true);
    } finally {
      if (cloneName) {
        await apiClient.deleteVirtualMachine(cloneName, testNamespace);
      }
      await apiClient.deleteVirtualMachine(sourceName, testNamespace);
    }
  });
});
