import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';
import { EnvVariables } from '@/utils/env-variables';

test.describe('VM wizard location and folder selection (gating)', { tag: [GATING_TAG] }, () => {
  test.beforeEach(async ({ page, vmCreationWizardPage }) => {
    test.setTimeout(120_000);
    await page.goto(`/k8s/ns/${EnvVariables.testNamespace}/kubevirt.io~v1~VirtualMachine`, {
      waitUntil: 'domcontentloaded',
    });
    await vmCreationWizardPage.openWizardFromCreateDropdown();
  });

  test('Back button is disabled on step 1', async ({ timeouts, vmCreationWizardPage }) => {
    await expect
      .poll(() => vmCreationWizardPage.verifyWizardVisible(), {
        message: 'Wizard should be visible',
        timeout: timeouts.DEFAULT,
      })
      .toBe(true);

    await expect
      .poll(() => vmCreationWizardPage.navigation.isBackButtonDisabled(), {
        message: 'Back button should be disabled on the first wizard step',
        timeout: timeouts.DEFAULT,
      })
      .toBe(true);
  });

  test('Edit Location panel shows project and folder fields', async ({
    timeouts,
    vmCreationWizardPage,
  }) => {
    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();

    await expect
      .poll(() => vmCreationWizardPage.location.verifyEditLocationButtonVisible(), {
        message: 'Edit Location button should be visible',
        timeout: timeouts.DEFAULT,
      })
      .toBe(true);

    await vmCreationWizardPage.location.openEditLocationPanel();

    const fields = await vmCreationWizardPage.location.verifyEditLocationPanelFields();
    expect
      .soft(fields.projectDropdown, 'Project dropdown should be present in Location panel')
      .toBe(true);
    expect
      .soft(fields.folderCombobox, 'Folder combobox should be present in Location panel')
      .toBe(true);

    await vmCreationWizardPage.location.closeEditLocationPanel();
  });

  test('Wizard close button is hidden', async ({ timeouts, vmCreationWizardPage }) => {
    await expect
      .poll(() => vmCreationWizardPage.location.verifyWizardCloseButtonHidden(), {
        message: 'Wizard close button (X) should be hidden',
        timeout: timeouts.DEFAULT,
      })
      .toBe(true);
  });
});
