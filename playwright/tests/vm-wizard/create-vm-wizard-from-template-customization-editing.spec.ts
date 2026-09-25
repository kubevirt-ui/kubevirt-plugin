import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';
const RHEL9_TEMPLATE = 'rhel9-server-small';

test.describe(
  'VM Creation Wizard — Create from Template: Customization editing and persistence',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Description and boot order edits persist across Back/Next navigation', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-tpl-edit');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — Create from Template, generate name', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');

        const isTemplateSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('fromTemplate');
        expect.soft(isTemplateSelected, 'Create from Template should be selected').toBe(true);

        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Template catalog — select the RHEL9 template', async () => {
        const catalogVisible = await vmWizardNavigationPage.verifyTemplateCatalogStepVisible();
        expect(catalogVisible, 'Template catalog should be visible').toBe(true);

        const cardCount = await vmWizardNavigationPage.getTemplateCatalogCount();
        expect(cardCount, 'At least one template card should be visible').toBeGreaterThan(0);

        await vmWizardNavigationPage.selectTemplateByTestId(RHEL9_TEMPLATE);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be enabled after selecting a template').toBe(false);

        await vmWizardNavigationPage.clickNext();
      });

      let vmName = '';

      await test.step('Step 3: Customization — edit Description', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        vmName = await vmWizardComputePage.getCustomizationVmName();
        expect(vmName.length, 'VM name should be available on the Details tab').toBeGreaterThan(0);

        await vmWizardComputePage.openCustomizationDescriptionModal(vmName);
        await vmWizardComputePage.fillCustomizationDescriptionModal('persisted description');
        await vmWizardComputePage.saveCustomizationDescriptionModal();

        await expect
          .poll(() => vmWizardComputePage.getCustomizationDescription(vmName), {
            message: 'The edited description should render immediately',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toContain('persisted description');
      });

      let bootOrderAfterEdit: string[] = [];

      await test.step('Step 3 (cont.): edit Boot order', async () => {
        await vmWizardComputePage.openBootOrderModal(vmName);
        const initialOrder = await vmWizardComputePage.getBootOrderModalDeviceNames();
        expect(
          initialOrder.length,
          'Boot order modal should list at least two devices',
        ).toBeGreaterThan(1);

        await vmWizardComputePage.reorderBootDeviceInModal(initialOrder[0], 'down');
        await vmWizardComputePage.saveBootOrderModal();

        bootOrderAfterEdit = utils.normalizeBootOrder(
          await vmWizardComputePage.getDisplayedBootOrder(vmName),
        );
        expect(bootOrderAfterEdit, 'The boot-order edit should move a device').toEqual(
          utils.moveFirstDeviceDown(initialOrder),
        );
      });

      await test.step('Back to Template step, then Next — edits should persist', async () => {
        await vmWizardNavigationPage.clickBack();
        const catalogVisible = await vmWizardNavigationPage.verifyTemplateCatalogStepVisible();
        expect(catalogVisible, 'Back should return to the Template catalog step').toBe(true);

        const templateSelected =
          await vmWizardNavigationPage.isTemplateSelectedByTestId(RHEL9_TEMPLATE);
        expect(templateSelected, 'The selected RHEL9 template should remain selected').toBe(true);

        await vmWizardNavigationPage.clickNext();
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Next should return to Customization step').toBe(true);

        const description = await vmWizardComputePage.getCustomizationDescription(vmName);
        expect(description, 'Description edit should persist after Back/Next').toContain(
          'persisted description',
        );

        const bootOrder = utils.normalizeBootOrder(
          await vmWizardComputePage.getDisplayedBootOrder(vmName),
        );
        expect(bootOrder, 'Boot order edit should persist after Back/Next').toEqual(
          bootOrderAfterEdit,
        );
      });
    });
  },
);
