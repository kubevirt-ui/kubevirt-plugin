import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';
const CUSTOMIZATION_STEP_ID = 'vm-creation-customization-step';
const GUEST_OS_STEP_ID = 'vm-creation-guest-os-step';
const TEMPLATE_STEP_ID = 'vm-creation-template-step';
const RHEL9_TEMPLATE = 'rhel9-server-small';

test.describe(
  'VM Creation Wizard — Step navigation sidebar preserves entered data',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Custom configuration — a Description edit survives direct step navigation', async ({
      apiClient,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-nav');
      await vmWizardNavigationPage.navigateToWizardInNamespace(wizardNs);

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.fillDeploymentDescription('test');
      await vmWizardNavigationPage.clickNext();

      await vmWizardNavigationPage.ensureGuestOsPreferenceSelected();
      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          message: 'Next should enable once a guest OS preference is selected',
          timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
        })
        .toBe(false);
      await vmWizardNavigationPage.clickNext();
      await vmWizardBootSourcePage.selectFirstBootVolumeOrNone();
      await vmWizardNavigationPage.clickNext();

      if (await vmWizardNavigationPage.isNextButtonDisabled()) {
        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('large');
      }
      await vmWizardNavigationPage.clickNext();

      const vmName = await vmWizardComputePage.getCustomizationVmName();
      await expect
        .poll(() => vmWizardComputePage.getCustomizationDescription(vmName), {
          message: 'Deployment-details description should appear on Customization',
          timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
        })
        .toContain('test');

      await test.step('Jump directly to the Guest OS step via the sidebar', async () => {
        await vmWizardNavigationPage.navigateToStepById(GUEST_OS_STEP_ID);
        const isActive = await vmWizardNavigationPage.verifyStepActive(GUEST_OS_STEP_ID);
        expect(isActive, 'Guest OS step should become the active step').toBe(true);
      });

      await test.step('Jump forward to the Customization step via the sidebar', async () => {
        await vmWizardNavigationPage.navigateToStepById(CUSTOMIZATION_STEP_ID);
        const isActive = await vmWizardNavigationPage.verifyStepActive(CUSTOMIZATION_STEP_ID);
        expect(isActive, 'Customization step should become the active step').toBe(true);

        const description = await vmWizardComputePage.getCustomizationDescription(vmName);
        expect(description, 'Description edit should be preserved after jumping forward').toContain(
          'test',
        );
      });
    });

    test('Create from Template — direct step navigation preserves the template selection', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-nav-tpl');
      await vmListPage.switchToVirtualizationPerspective();
      await vmWizardNavigationPage.navigateToWizardInNamespace(wizardNs);

      await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
      await vmWizardNavigationPage.generateVmName();

      await vmWizardNavigationPage.clickNext();
      await vmWizardNavigationPage.selectTemplateByTestId(RHEL9_TEMPLATE);
      const templateCardCount = await vmWizardNavigationPage.getTemplateCatalogCount();
      expect(templateCardCount, 'At least one template card should exist').toBeGreaterThan(0);

      await vmWizardNavigationPage.clickNext();

      await test.step('Jump back to the Template step via the sidebar', async () => {
        await vmWizardNavigationPage.navigateToStepById(TEMPLATE_STEP_ID);
        const isActive = await vmWizardNavigationPage.verifyStepActive(TEMPLATE_STEP_ID);
        expect(isActive, 'Template step should become the active step').toBe(true);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should remain enabled — template selection persisted').toBe(
          false,
        );

        const templateSelected = await vmWizardNavigationPage.isTemplateSelectedByTestId(
          RHEL9_TEMPLATE,
        );
        expect(templateSelected, 'The selected RHEL9 template should remain selected').toBe(true);
      });

      await test.step('Jump forward to the Customization step via the sidebar', async () => {
        await vmWizardNavigationPage.navigateToStepById(CUSTOMIZATION_STEP_ID);
        const isActive = await vmWizardNavigationPage.verifyStepActive(CUSTOMIZATION_STEP_ID);
        expect(isActive, 'Customization step should become the active step').toBe(true);
      });
    });
  },
);
