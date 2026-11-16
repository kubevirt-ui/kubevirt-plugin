import { T1_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(
  `VM wizard custom configuration boot source ${ROUTE_VM_WIZARD_TAG} ${T1_TAG} ${NON_PRIV_TAG}`,
  () => {
    test('Boot source step lists common OS images without developer preview label', async ({
      testNamespace,
      vmCreationWizardPage,
      vmListPage,
    }) => {
      await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
      await vmCreationWizardPage.advanceToBootSourceStep();

      const bootVisible = await vmCreationWizardPage.verifyBootSourceStepVisible();
      expect(bootVisible, 'Boot source step should be visible').toBe(true);

      const volumeCount = await vmCreationWizardPage.getBootVolumeCount();
      if (volumeCount > 0) {
        await expect(
          vmCreationWizardPage
            .bootVolumeRowMatching(/rhel9|rhel10|fedora|centos/i)
            .or(vmCreationWizardPage.bootVolumeRowMatching(/rhel|fedora|centos/i)),
        ).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
      }

      await expect(vmCreationWizardPage.developerPreviewLabel()).toHaveCount(0);
    });
  },
);
