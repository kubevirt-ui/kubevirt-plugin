import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Creation method switching updates the step list',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Switching between Custom configuration, Template, and Clone updates the wizard step navigation', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Custom configuration shows Guest OS, Boot source and Compute resources steps', async () => {
        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect
          .soft(isCustomSelected, 'Custom configuration should be selected by default')
          .toBe(true);

        const stepIds = await vmWizardNavigationPage.getCloneWizardStepIds();
        expect(stepIds, 'Custom configuration flow should have 6 steps').toHaveLength(6);
        expect(stepIds).toContain('vm-creation-guest-os-step');
        expect(stepIds).toContain('vm-creation-boot-source-step');
        expect(stepIds).toContain('vm-creation-compute-resources-step');
      });

      await test.step('Create from Template shows the Template step instead', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');

        const stepIds = await vmWizardNavigationPage.getCloneWizardStepIds();
        expect(stepIds, 'Template flow should have 4 steps').toHaveLength(4);
        expect(stepIds).toContain('vm-creation-template-step');
        expect(stepIds).not.toContain('vm-creation-guest-os-step');
        expect(stepIds).not.toContain('vm-creation-boot-source-step');
        expect(stepIds).not.toContain('vm-creation-compute-resources-step');
      });

      await test.step('Clone existing VirtualMachine shows the Clone/Source step instead', async () => {
        await vmWizardNavigationPage.selectCreationMethod('cloneVm');

        const stepIds = await vmWizardNavigationPage.getCloneWizardStepIds();
        expect(stepIds, 'Clone flow should have 3 steps').toHaveLength(3);
        expect(stepIds).toContain('vm-creation-clone-step');
        expect(stepIds).not.toContain('vm-creation-template-step');
        expect(stepIds).not.toContain('vm-creation-guest-os-step');
      });

      await test.step('Switching back to Custom configuration restores the original steps', async () => {
        await vmWizardNavigationPage.selectCreationMethod('newVm');

        const stepIds = await vmWizardNavigationPage.getCloneWizardStepIds();
        expect(stepIds, 'Custom configuration flow should have 6 steps again').toHaveLength(6);
        expect(stepIds).toContain('vm-creation-guest-os-step');
      });

      await vmWizardNavigationPage.cancelWizard();
    });
  },
);
