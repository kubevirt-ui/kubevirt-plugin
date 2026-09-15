import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';
const CUSTOM_DESCRIPTION = 'Customization that should survive regeneration';
const CUSTOM_HOSTNAME = 'reconciled-hostname';
const EPHEMERAL_DISK_CONTAINER = 'quay.io/containerdisks/fedora:latest';
const EPHEMERAL_DISK_NAME = 'test';
const GENERATED_ROOT_DISK_NAME = 'rootdisk';

test.describe(
  'VM Creation Wizard — Custom configuration',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Custom configuration wizard creates a RHEL VM through all steps and reaches Running state', async ({
      apiClient,
      vmListPage,
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

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
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

        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('medium');

        const sizeText = await vmWizardComputePage.getComputeSizeDropdownText();
        expect.soft(sizeText, 'A medium compute size should be selected').toContain('CPUs');

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

        await test.step('Empty annotation rows cannot be saved', async () => {
          await vmWizardComputePage.selectCustomizationTab('Labels and annotations');
          await vmWizardComputePage.openAnnotationsModal();
          await vmWizardComputePage.clickAddMoreInAnnotationsModal();

          const saveDisabled = await vmWizardComputePage.isAnnotationsModalSaveDisabled();
          expect(saveDisabled, 'Save should be disabled for empty annotation fields').toBe(true);

          await vmWizardComputePage.closeAnnotationsModal();
        });

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

    test('Custom configuration preserves unrelated customization when previous steps change', async ({
      apiClient,
      vmListPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const wizardNamespace = await setupTestNamespace(apiClient, 'wizard-reconcile');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Configure an Other Linux VM without a boot source and with medium compute size', async () => {
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();

        await vmWizardNavigationPage.selectOperatingSystem('otherLinux');
        await vmWizardNavigationPage.clickNext();

        await vmWizardBootSourcePage.selectNoBootSource();
        await vmWizardNavigationPage.clickNext();

        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('medium');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Customize hostname, description, storage, and boot order', async () => {
        const generatedHostname = await vmWizardComputePage.getCustomizationVmName();
        expect(generatedHostname, 'Generated hostname should be available').not.toBe('');

        await vmWizardComputePage.openHostnameModal(generatedHostname);
        await vmWizardComputePage.fillHostnameModal(CUSTOM_HOSTNAME);
        await vmWizardComputePage.saveHostnameModal();
        await vmWizardComputePage.editCustomizationDescription(CUSTOM_DESCRIPTION);
        await vmWizardComputePage.addEphemeralDisk({
          containerImage: EPHEMERAL_DISK_CONTAINER,
          diskName: EPHEMERAL_DISK_NAME,
          useAsBootSource: true,
        });

        await vmWizardComputePage.selectCustomizationTab('Details');
        expect(await vmWizardComputePage.getCustomizationVmName()).toBe(CUSTOM_HOSTNAME);
        expect(await vmWizardComputePage.getCustomizationDescription()).toContain(
          CUSTOM_DESCRIPTION,
        );
        expect(await vmWizardComputePage.getCustomizationBootOrder()).toContain(
          EPHEMERAL_DISK_NAME,
        );
        expect(await vmWizardComputePage.isStorageDiskPresent(EPHEMERAL_DISK_NAME)).toBe(true);
      });

      await test.step('Preserve customization after visiting Compute resources without changes', async () => {
        await vmWizardNavigationPage.clickBack();
        await vmWizardNavigationPage.clickNext();

        await vmWizardComputePage.selectCustomizationTab('Details');
        expect(await vmWizardComputePage.getCustomizationVmName()).toBe(CUSTOM_HOSTNAME);
        expect(await vmWizardComputePage.getCustomizationDescription()).toContain(
          CUSTOM_DESCRIPTION,
        );
        expect(await vmWizardComputePage.getCustomizationBootOrder()).toContain(
          EPHEMERAL_DISK_NAME,
        );
        expect(await vmWizardComputePage.isStorageDiskPresent(EPHEMERAL_DISK_NAME)).toBe(true);
      });

      await test.step('Preserve customization after changing the compute size', async () => {
        await vmWizardNavigationPage.clickBack();
        await vmWizardComputePage.selectComputeSize('large');
        await vmWizardNavigationPage.clickNext();

        await vmWizardComputePage.selectCustomizationTab('Details');
        expect(await vmWizardComputePage.getCustomizationVmName()).toBe(CUSTOM_HOSTNAME);
        expect(await vmWizardComputePage.getCustomizationDescription()).toContain(
          CUSTOM_DESCRIPTION,
        );
        expect(await vmWizardComputePage.getCustomizationBootOrder()).toContain(
          EPHEMERAL_DISK_NAME,
        );
        expect(await vmWizardComputePage.isStorageDiskPresent(EPHEMERAL_DISK_NAME)).toBe(true);
      });

      await test.step('Preserve unrelated values but refresh storage after changing only the Guest OS', async () => {
        await vmWizardNavigationPage.clickBack();
        await vmWizardNavigationPage.clickBack();
        await vmWizardNavigationPage.clickBack();

        await vmWizardNavigationPage.selectOperatingSystem('rhel');
        await vmWizardNavigationPage.clickNext();

        await vmWizardBootSourcePage.selectNoBootSource();
        await vmWizardNavigationPage.clickNext();
        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('large');
        await vmWizardNavigationPage.clickNext();

        await vmWizardComputePage.selectCustomizationTab('Details');
        expect(await vmWizardComputePage.getCustomizationVmName()).toBe(CUSTOM_HOSTNAME);
        expect(await vmWizardComputePage.getCustomizationDescription()).toContain(
          CUSTOM_DESCRIPTION,
        );
        expect(await vmWizardComputePage.getCustomizationBootOrder()).not.toContain(
          EPHEMERAL_DISK_NAME,
        );
        expect(await vmWizardComputePage.isStorageDiskPresent(EPHEMERAL_DISK_NAME)).toBe(false);
      });

      await test.step('Add storage customization again before changing the boot source', async () => {
        await vmWizardComputePage.addEphemeralDisk({
          containerImage: EPHEMERAL_DISK_CONTAINER,
          diskName: EPHEMERAL_DISK_NAME,
          useAsBootSource: true,
        });

        await vmWizardComputePage.selectCustomizationTab('Details');
        expect(await vmWizardComputePage.getCustomizationVmName()).toBe(CUSTOM_HOSTNAME);
        expect(await vmWizardComputePage.getCustomizationDescription()).toContain(
          CUSTOM_DESCRIPTION,
        );
        expect(await vmWizardComputePage.getCustomizationBootOrder()).toContain(
          EPHEMERAL_DISK_NAME,
        );
        expect(await vmWizardComputePage.isStorageDiskPresent(EPHEMERAL_DISK_NAME)).toBe(true);
      });

      await test.step('Preserve unrelated values but refresh storage after changing only the boot source', async () => {
        await vmWizardNavigationPage.clickBack();
        await vmWizardNavigationPage.clickBack();

        await vmWizardBootSourcePage.selectBootVolume();
        await vmWizardBootSourcePage.selectBootVolumeByName('rhel');
        await vmWizardNavigationPage.clickNext();
        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('large');
        await vmWizardNavigationPage.clickNext();

        await vmWizardComputePage.selectCustomizationTab('Details');
        expect(await vmWizardComputePage.getCustomizationVmName()).toBe(CUSTOM_HOSTNAME);
        expect(await vmWizardComputePage.getCustomizationDescription()).toContain(
          CUSTOM_DESCRIPTION,
        );
        const reconciledBootOrder = await vmWizardComputePage.getCustomizationBootOrder();
        expect(reconciledBootOrder).not.toContain(EPHEMERAL_DISK_NAME);
        expect(reconciledBootOrder).toContain(GENERATED_ROOT_DISK_NAME);
        expect(await vmWizardComputePage.isStorageDiskPresent(EPHEMERAL_DISK_NAME)).toBe(false);
        expect(await vmWizardComputePage.isStorageDiskPresent(GENERATED_ROOT_DISK_NAME)).toBe(true);
      });
    });
  },
);
