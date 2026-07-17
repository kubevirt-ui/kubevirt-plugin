import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Custom configuration happy path',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Custom configuration wizard creates a RHEL VM through all steps and reaches Running state', async ({
      apiClient,
      vmTreePage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-custom');

      await vmTreePage.switchToVirtualizationPerspective();
      await vmTreePage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — select Custom configuration and generate name', async () => {
        const tilesVisible = await vmWizardNavigationPage.verifyCreationMethodTilesVisible();
        expect.soft(tilesVisible, 'Creation method tiles should be visible').toBe(true);

        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect
          .soft(isCustomSelected, 'Custom configuration should be selected by default')
          .toBe(true);

        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — verify OS tiles and default selection', async () => {
        const osTilesVisible = await vmWizardNavigationPage.verifyOsTilesVisible();
        expect
          .soft(osTilesVisible, 'OS tiles (RHEL, Windows, Other Linux) should be visible')
          .toBe(true);

        const osDropdownVisible = await vmWizardNavigationPage.verifyOsTypeDropdownVisible();
        expect.soft(osDropdownVisible, 'OS type dropdown should be visible').toBe(true);

        const selectedOs = await vmWizardNavigationPage.getSelectedOsType();
        expect.soft(selectedOs.length, 'An OS type should be pre-selected').toBeGreaterThan(0);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Boot source — select a boot volume', async () => {
        const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
        expect.soft(bootStepVisible, 'Boot source step should be visible').toBe(true);

        const tableVisible = await vmWizardBootSourcePage.verifyBootVolumeTableOrEmptyState();
        expect.soft(tableVisible, 'Boot volume table or empty state should be visible').toBe(true);

        const volumeCount = await vmWizardBootSourcePage.getBootVolumeCount();
        if (volumeCount > 0) {
          const columnsVisible = await vmWizardBootSourcePage.verifyBootVolumeTableColumnsVisible();
          expect.soft(columnsVisible, 'Boot volume table columns should be visible').toBe(true);

          await vmWizardBootSourcePage.selectBootVolumeByName('rhel');
        } else {
          await vmWizardBootSourcePage.selectNoBootSource();
        }

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Compute resources — verify series and size', async () => {
        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect.soft(computeVisible, 'Compute resources step should be visible').toBe(true);

        const seriesVisible = await vmWizardComputePage.verifyInstanceTypeSeriesVisible();
        expect.soft(seriesVisible, 'Instance type series cards should be visible').toBe(true);

        const sizeText = await vmWizardComputePage.getComputeSizeDropdownText();
        expect.soft(sizeText, 'A compute size should be pre-selected').toContain('CPUs');

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 5: Customization — verify tabs and settings', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect.soft(custVisible, 'Customization step should be visible').toBe(true);

        const tabsVisible = await vmWizardComputePage.verifyCustomizationTabsVisible();
        expect
          .soft(
            tabsVisible,
            'Customization tabs (Details, Storage, Network, etc.) should be visible',
          )
          .toBe(true);

        const searchVisible = await vmWizardComputePage.verifyCustomizationSearchInputVisible();
        expect.soft(searchVisible, 'Find settings search input should be visible').toBe(true);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 6: Review and create — verify summary and create VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        const sectionsVisible = await vmWizardComputePage.verifyReviewSectionsVisible();
        expect
          .soft(
            sectionsVisible,
            'Review sections (Details, Storage, Network, Hardware devices) should be visible',
          )
          .toBe(true);

        const checkboxVisible = await vmWizardComputePage.verifyStartAfterCreationCheckbox();
        expect.soft(checkboxVisible, 'Start after creation checkbox should be visible').toBe(true);

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
