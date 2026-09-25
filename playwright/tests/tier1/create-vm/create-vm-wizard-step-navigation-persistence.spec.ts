import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';
const CUSTOMIZATION_STEP_ID = 'vm-creation-customization-step';
const GUEST_OS_STEP_ID = 'vm-creation-guest-os-step';
const REVIEW_STEP_ID = 'vm-creation-review-and-create-step';
const TEMPLATE_STEP_ID = 'vm-creation-template-step';
const RHEL9_TEMPLATE = 'rhel9-server-small';

test.describe(
  'VM Creation Wizard — Step navigation sidebar preserves entered data',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Custom configuration — jumping via the step nav preserves the guest OS selection and a Description edit', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-nav');
      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.clickNext();

      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          message: 'Next should enable once the guest OS type list finishes loading',
          timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
      const selectedOs = await vmWizardNavigationPage.getSelectedOsType();
      expect(
        selectedOs.length,
        'A guest OS type should be selected before navigation',
      ).toBeGreaterThan(0);

      await vmWizardNavigationPage.clickNext();
      await vmWizardBootSourcePage.selectFirstBootVolumeOrNone();
      await vmWizardNavigationPage.clickNext();
      await vmWizardNavigationPage.clickNext();

      const vmName = await vmWizardComputePage.getCustomizationVmName();
      await vmWizardComputePage.openCustomizationDescriptionModal(vmName);
      await vmWizardComputePage.fillCustomizationDescriptionModal('test');
      await vmWizardComputePage.saveCustomizationDescriptionModal();

      await test.step('Jump directly to the Guest OS step via the sidebar', async () => {
        await vmWizardNavigationPage.navigateToStepById(GUEST_OS_STEP_ID);
        const isActive = await vmWizardNavigationPage.verifyStepActive(GUEST_OS_STEP_ID);
        expect(isActive, 'Guest OS step should become the active step').toBe(true);

        const osAfterJump = await vmWizardNavigationPage.getSelectedOsType();
        expect(osAfterJump, 'Guest OS selection should be preserved after jumping back').toBe(
          selectedOs,
        );
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

      await vmWizardNavigationPage.cancelWizard();
    });

    test('Create from Template — the Review nav item is disabled until reached, and jumping back preserves the template selection', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-nav-tpl');
      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
      await vmWizardNavigationPage.generateVmName();

      const reviewDisabledEarly = await vmWizardNavigationPage.isStepNavDisabled(REVIEW_STEP_ID);
      expect(reviewDisabledEarly, 'Review nav item should be disabled before it is reached').toBe(
        true,
      );

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

        const templateSelected =
          await vmWizardNavigationPage.isTemplateSelectedByTestId(RHEL9_TEMPLATE);
        expect(templateSelected, 'The selected RHEL9 template should remain selected').toBe(true);
      });

      await test.step('Jump forward to the Customization step via the sidebar', async () => {
        await vmWizardNavigationPage.navigateToStepById(CUSTOMIZATION_STEP_ID);
        const isActive = await vmWizardNavigationPage.verifyStepActive(CUSTOMIZATION_STEP_ID);
        expect(isActive, 'Customization step should become the active step').toBe(true);
      });

      await vmWizardNavigationPage.cancelWizard();
    });
  },
);
