import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';
const RHEL9_TEMPLATE = 'rhel9-server-small';

const moveFirstDeviceDown = (devices: string[]): string[] => [
  devices[1],
  devices[0],
  ...devices.slice(2),
];

// Expected behavior: the read-only Customization boot-order summary suffixes NIC
// device names with " (NIC)" for clarity (existing behavior, unrelated to this test),
// while the Boot order modal itself shows bare device names. Normalize before comparing
// or reusing names across the two surfaces.
const stripNicSuffix = (deviceName: string): string => deviceName.replace(/ \(NIC\)$/, '');
const normalizeBootOrder = (devices: string[]): string[] => devices.map(stripNicSuffix);

test.describe(
  'VM Creation Wizard — Create from Template: Customization editing and persistence',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Description and boot order edits persist across Back/Next navigation', async ({
      apiClient,
      vmListPage,
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

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-tpl-edit');

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

      await test.step('Step 3: Customization — edit Description twice, verify each render', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        vmName = await vmWizardComputePage.getCustomizationVmName();
        expect(vmName.length, 'VM name should be available on the Details tab').toBeGreaterThan(0);

        await vmWizardComputePage.openCustomizationDescriptionModal(vmName);
        await vmWizardComputePage.fillCustomizationDescriptionModal('test');
        await vmWizardComputePage.saveCustomizationDescriptionModal();

        await expect
          .poll(() => vmWizardComputePage.getCustomizationDescription(vmName), {
            message: 'Description should render "test" after the first edit',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toContain('test');

        await vmWizardComputePage.openCustomizationDescriptionModal(vmName);
        await vmWizardComputePage.fillCustomizationDescriptionModal('test test');
        await vmWizardComputePage.saveCustomizationDescriptionModal();

        await expect
          .poll(() => vmWizardComputePage.getCustomizationDescription(vmName), {
            message: 'Description should render "test test" after the second edit',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toContain('test test');
      });

      let bootOrderAfterEdit: string[] = [];

      await test.step('Step 3 (cont.): edit Boot order twice, verify each render', async () => {
        await vmWizardComputePage.openBootOrderModal(vmName);
        const initialOrder = await vmWizardComputePage.getBootOrderModalDeviceNames();
        expect(
          initialOrder.length,
          'Boot order modal should list at least two devices',
        ).toBeGreaterThan(1);

        await vmWizardComputePage.reorderBootDeviceInModal(initialOrder[0], 'down');
        await vmWizardComputePage.saveBootOrderModal();

        const displayedOrderAfterFirstEdit = normalizeBootOrder(
          await vmWizardComputePage.getDisplayedBootOrder(vmName),
        );
        expect(
          displayedOrderAfterFirstEdit,
          'The first boot-order edit should move a device',
        ).toEqual(moveFirstDeviceDown(initialOrder));

        await vmWizardComputePage.openBootOrderModal(vmName);
        await vmWizardComputePage.reorderBootDeviceInModal(displayedOrderAfterFirstEdit[0], 'down');
        await vmWizardComputePage.saveBootOrderModal();

        bootOrderAfterEdit = normalizeBootOrder(await vmWizardComputePage.getDisplayedBootOrder(vmName));
        expect(bootOrderAfterEdit, 'The second boot-order edit should move a device again').toEqual(
          moveFirstDeviceDown(displayedOrderAfterFirstEdit),
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
          'test test',
        );

        const bootOrder = normalizeBootOrder(await vmWizardComputePage.getDisplayedBootOrder(vmName));
        expect(bootOrder, 'Boot order edit should persist after Back/Next').toEqual(
          bootOrderAfterEdit,
        );

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Review and create — verify prior selections are displayed', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        const sectionsVisible = await vmWizardComputePage.verifyReviewSectionsVisible();
        expect
          .soft(
            sectionsVisible,
            'Review sections (Details, Storage, Network, Hardware devices) should be visible',
          )
          .toBe(true);

        // Create from Template is a non-clone flow: the Review step's Name field is static
        // read-only text (see ReviewGridLeftColumn.tsx), not an editable input.
        const reviewName = await vmWizardComputePage.getReviewVmNameFromDetails();
        expect(reviewName, 'Review should display the generated VM name').toBe(vmName);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify VM resource was created', async () => {
        const createdVmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        expect(createdVmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        apiClient.trackResource('VirtualMachine', createdVmName, wizardNs);

        const result = await apiClient.verifyVmCreated(createdVmName, wizardNs);
        expect.soft(result.exists, `VM '${createdVmName}' should exist`).toBe(true);
      });
    });
  },
);
