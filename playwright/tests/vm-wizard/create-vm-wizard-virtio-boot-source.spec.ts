import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — VirtIO recommendation and boot source features',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('VirtIO recommendation alert appears for Windows template and switching works', async ({
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      apiClient,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-virtio');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details — select From Template', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Template catalog — select Windows Server 2022', async () => {
        const catalogVisible = await vmWizardNavigationPage.verifyTemplateCatalogStepVisible();
        expect(catalogVisible, 'Template catalog should be visible').toBe(true);

        await vmWizardNavigationPage.selectTemplateByTestId('windows2k22-server-medium');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Customization — Storage tab VirtIO alert', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        await vmWizardComputePage.selectCustomizationTab('Storage');

        const diskAlertVisible =
          await vmWizardComputePage.isVirtioRecommendationAlertVisible('disk');
        expect(diskAlertVisible, 'VirtIO disk recommendation alert should be visible').toBe(true);

        await vmWizardComputePage.clickSwitchAllToVirtio('disk');
        await vmWizardComputePage.waitForVirtioAlertToDisappear('disk');

        const diskAlertGone =
          await vmWizardComputePage.isVirtioRecommendationAlertVisible('disk');
        expect(diskAlertGone, 'VirtIO disk alert should be gone after switching').toBe(false);
      });

      await test.step('Step 3b: Customization — Network tab VirtIO alert', async () => {
        await vmWizardComputePage.selectCustomizationTab('Network');

        const networkAlertVisible =
          await vmWizardComputePage.isVirtioRecommendationAlertVisible('network');
        expect(
          networkAlertVisible,
          'VirtIO network recommendation alert should be visible',
        ).toBe(true);

        await vmWizardComputePage.clickSwitchAllToVirtio('network');
        await vmWizardComputePage.waitForVirtioAlertToDisappear('network');

        const networkAlertGone =
          await vmWizardComputePage.isVirtioRecommendationAlertVisible('network');
        expect(networkAlertGone, 'VirtIO network alert should be gone after switching').toBe(
          false,
        );

        const nicModel = await vmWizardComputePage.getNetworkInterfaceModelInWizard('default');
        expect(nicModel.toLowerCase(), 'Default NIC model should be virtio after switch').toBe(
          'virtio',
        );
      });
    });

    test('VirtIO recommendation alert does NOT appear for RHEL template', async ({
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      apiClient,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-rhel-virtio');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details — select From Template', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Template catalog — select RHEL9', async () => {
        await vmWizardNavigationPage.selectTemplateByTestId('rhel9-server-small');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Customization — verify no VirtIO alerts', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        const storageContent = await vmWizardComputePage.verifyStorageTabContent();
        expect(storageContent.diskList, 'Storage tab disk list should be visible').toBe(true);
        const diskAlert = await vmWizardComputePage.isVirtioRecommendationAlertVisible('disk');
        expect(diskAlert, 'No VirtIO disk alert for RHEL template').toBe(false);

        const networkContent = await vmWizardComputePage.verifyNetworkTabContent();
        expect(networkContent.interfaceTable, 'Network tab table should be visible').toBe(true);
        const networkAlert =
          await vmWizardComputePage.isVirtioRecommendationAlertVisible('network');
        expect(networkAlert, 'No VirtIO network alert for RHEL template').toBe(false);
      });
    });

    test('Change boot source from template drawer', async ({
      vmListPage,
      vmWizardNavigationPage,
      apiClient,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-bootsrc');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details — select From Template', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Template catalog — select RHEL9 and verify boot source', async () => {
        await vmWizardNavigationPage.selectTemplateByTestId('rhel9-server-small');

        const isEditable = await vmWizardNavigationPage.isTemplateBootSourceEditable();
        expect(isEditable, 'Boot source should be editable for sourceRef-backed template').toBe(
          true,
        );

        const initialBootSource = await vmWizardNavigationPage.getTemplateDrawerBootSourceText();
        expect(initialBootSource.length, 'Initial boot source text should not be empty').toBeGreaterThan(0);

        await vmWizardNavigationPage.clickEditBootSource();

        const modalOpen = await vmWizardNavigationPage.isChangeBootSourceModalOpen();
        expect(modalOpen, 'Change boot source modal should be open').toBe(true);
      });
    });

    test('Change boot source modal cancel preserves original', async ({
      vmListPage,
      vmWizardNavigationPage,
      apiClient,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-bootsrc-cancel');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Select From Template and generate name', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Open boot source modal, cancel, verify unchanged', async () => {
        await vmWizardNavigationPage.selectTemplateByTestId('rhel9-server-small');

        const initialBootSource = await vmWizardNavigationPage.getTemplateDrawerBootSourceText();

        await vmWizardNavigationPage.clickEditBootSource();
        const modalOpen = await vmWizardNavigationPage.isChangeBootSourceModalOpen();
        expect(modalOpen, 'Modal should be open').toBe(true);

        await vmWizardNavigationPage.cancelChangeBootSource();

        const modalClosed = await vmWizardNavigationPage.isChangeBootSourceModalOpen();
        expect(modalClosed, 'Modal should be closed after cancel').toBe(false);

        const afterCancelBootSource =
          await vmWizardNavigationPage.getTemplateDrawerBootSourceText();
        expect(
          afterCancelBootSource,
          'Boot source should be unchanged after cancel',
        ).toBe(initialBootSource);
      });
    });

    test('Disk interface is VirtIO after switch and VM creation from Windows template', async ({
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      apiClient,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-virtio-create');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details — From Template', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Select Windows 2022 template', async () => {
        await vmWizardNavigationPage.selectTemplateByTestId('windows2k22-server-medium');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Switch disk interfaces to VirtIO and verify', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        await vmWizardComputePage.selectCustomizationTab('Storage');

        const initialInterface =
          await vmWizardComputePage.getDiskInterfaceValueInWizard('rootdisk');
        expect(
          initialInterface.toLowerCase(),
          'Windows template root disk should default to sata',
        ).toBe('sata');

        await vmWizardComputePage.clickSwitchAllToVirtio('disk');
        await vmWizardComputePage.waitForVirtioAlertToDisappear('disk');

        const updatedInterface =
          await vmWizardComputePage.getDiskInterfaceValueInWizard('rootdisk');
        expect(
          updatedInterface.toLowerCase(),
          'Disk interface should be virtio after switch',
        ).toBe('virtio');

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Review and create VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify VM disk bus is VirtIO via API', async () => {
        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        apiClient.trackResource('VirtualMachine', vmName, wizardNs);

        const result = await apiClient.verifyVmCreated(vmName, wizardNs);
        expect.soft(result.exists, `VM '${vmName}' should exist`).toBe(true);

        const diskBus = await apiClient.getVmDiskBus(vmName, wizardNs, 'rootdisk');
        expect(diskBus, 'Root disk bus should be virtio after switch').toBe('virtio');
      });
    });
  },
);
