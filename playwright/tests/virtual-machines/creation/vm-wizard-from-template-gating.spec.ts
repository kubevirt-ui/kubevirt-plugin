import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { VM_FROM_CATALOG } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(
  `VM wizard Create from Template ${ROUTE_VM_WIZARD_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`,
  () => {
    test('ID(CNV-8848) Create from Template through review creates a VirtualMachine', async ({
      apiClient,
      testNamespace,
      vmCreationWizardPage,
      vmListPage,
    }) => {
      let createdName = '';

      try {
        await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
        await vmCreationWizardPage.advanceFromTemplateToReview(
          VM_FROM_CATALOG.templateMetadataName,
        );
        await expect
          .poll(() => vmCreationWizardPage.verifyReviewStepVisible(), {
            timeout: TestTimeouts.LONG_OPERATION,
          })
          .toBe(true);
        await vmCreationWizardPage.clickCreateVirtualMachine();
        await vmCreationWizardPage.page.waitForURL(/VirtualMachine\//, {
          timeout: TestTimeouts.VM_CREATION,
        });
        createdName = await vmCreationWizardPage.getCreatedVmNameFromUrl();
        const resolvedVm = vmListPage.resolvedVirtualMachineName(testNamespace, createdName);
        await expect
          .poll(() => apiClient.virtualMachineExists(resolvedVm, testNamespace), {
            message: `VirtualMachine ${testNamespace}/${resolvedVm} should exist`,
            timeout: TestTimeouts.VM_CREATION,
          })
          .toBe(true);
      } finally {
        if (createdName) {
          await apiClient.deleteVirtualMachine(createdName, testNamespace);
        }
      }
    });
  },
);
