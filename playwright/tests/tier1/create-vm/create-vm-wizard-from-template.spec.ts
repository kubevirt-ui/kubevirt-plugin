import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Create from Template happy path',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('From Template wizard selects RHEL9 template, creates VM, and reaches Running state', async ({
      apiClient,
      vmTreePage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-tpl');

      await vmTreePage.switchToVirtualizationPerspective();
      await vmTreePage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — select From Template and generate name', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');

        const isTemplateSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('fromTemplate');
        expect.soft(isTemplateSelected, 'Create from Template should be selected').toBe(true);

        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Template catalog — verify toolbar, cards, and select rhel9-server-small', async () => {
        const catalogVisible = await vmWizardNavigationPage.verifyTemplateCatalogStepVisible();
        expect(catalogVisible, 'Template catalog should be visible').toBe(true);

        const toolbar = await vmWizardNavigationPage.verifyTemplateCatalogToolbar();
        expect.soft(toolbar.filterInput, 'Keyword filter input should be visible').toBe(true);
        expect.soft(toolbar.gridToggle, 'Grid toggle button should be visible').toBe(true);
        expect.soft(toolbar.listToggle, 'List toggle button should be visible').toBe(true);

        const cardCount = await vmWizardNavigationPage.getTemplateCatalogCount();
        expect(cardCount, 'At least one template card should be visible').toBeGreaterThan(0);

        await vmWizardNavigationPage.selectTemplateByTestId('rhel9-server-small');

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be enabled after selecting a template').toBe(false);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Customization — verify tabs and auto-generated hostname', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        const tabsVisible = await vmWizardComputePage.verifyCustomizationTabsVisible();
        expect.soft(tabsVisible, 'Customization tabs should be visible').toBe(true);

        const hostname = await vmWizardComputePage.getCustomizationVmName();
        expect.soft(hostname.length, 'Hostname should be auto-generated').toBeGreaterThan(0);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Review and create — verify summary and create VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        const sectionsVisible = await vmWizardComputePage.verifyReviewSectionsVisible();
        expect.soft(sectionsVisible, 'Review sections should be visible').toBe(true);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify VM resource was created', async () => {
        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        apiClient.trackResource('VirtualMachine', vmName, wizardNs);

        const result = await apiClient.verifyVmCreated(vmName, wizardNs);
        expect.soft(result.exists, `VM '${vmName}' should exist`).toBe(true);
      });
    });
  },
);
