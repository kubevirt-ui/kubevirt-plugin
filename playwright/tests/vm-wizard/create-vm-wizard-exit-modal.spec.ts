import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';
const RHEL9_TEMPLATE = 'rhel9-server-small';

test.describe(
  'VM Creation Wizard — Exit modal guards unsaved changes',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('No exit modal when navigating away from a clean wizard', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Cancel the wizard without making any changes', async () => {
        await vmWizardNavigationPage.clickCancelButton();

        const modalNotShown = await vmWizardNavigationPage.verifyExitModalNotShown();
        expect(modalNotShown, 'Exit modal should not appear on a clean wizard').toBe(true);

        const wizardClosed = await vmWizardNavigationPage.verifyWizardClosed();
        expect(wizardClosed, 'Wizard should close without confirmation').toBe(true);
      });
    });

    test('Exit modal appears when cancelling a dirty wizard', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Fill in the VM name to make the form dirty', async () => {
        await vmWizardNavigationPage.fillVmName('test-exit-modal');
      });

      await test.step('Cancel and verify the exit modal appears with correct content', async () => {
        await vmWizardNavigationPage.clickCancelButton();

        const modalVisible = await vmWizardNavigationPage.isExitModalVisible();
        expect(modalVisible, 'Exit modal should appear when form is dirty').toBe(true);

        const title = await vmWizardNavigationPage.getExitModalTitle();
        expect(title, 'Modal title should ask about exiting').toBe(
          'Exit VirtualMachine creation?',
        );

        const body = await vmWizardNavigationPage.getExitModalBody();
        expect(body, 'Modal body should warn about unsaved data').toContain(
          "If you leave now, any information you've entered won't be saved.",
        );
      });
    });

    test('Clicking "Exit without saving" discards changes and navigates away', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();
      await vmWizardNavigationPage.fillVmName('test-discard');

      await test.step('Cancel and click "Exit without saving"', async () => {
        await vmWizardNavigationPage.clickCancelButton();

        const modalVisible = await vmWizardNavigationPage.isExitModalVisible();
        expect(modalVisible, 'Exit modal should appear').toBe(true);

        await vmWizardNavigationPage.clickExitWithoutSaving();
      });

      await test.step('Verify the wizard closed and user reached the VM list', async () => {
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmList();
        expect(redirected, 'Should navigate back to the VM list').toBe(true);
      });
    });

    test('Clicking "Continue creating" keeps the wizard open with changes intact', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const vmName = 'keep-my-changes';
      await vmWizardNavigationPage.fillVmName(vmName);

      await test.step('Cancel and click "Continue creating"', async () => {
        await vmWizardNavigationPage.clickCancelButton();

        const modalVisible = await vmWizardNavigationPage.isExitModalVisible();
        expect(modalVisible, 'Exit modal should appear').toBe(true);

        await vmWizardNavigationPage.clickContinueCreating();
      });

      await test.step('Verify the wizard is still open and the VM name is preserved', async () => {
        const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
        expect(wizardVisible, 'Wizard should remain open after continuing').toBe(true);

        const currentName = await vmWizardNavigationPage.getVmName();
        expect(currentName, 'VM name should be preserved after dismissing the modal').toBe(vmName);
      });
    });

    test('Browser reload shows native beforeunload dialog on a dirty wizard', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
      page,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();
      await vmWizardNavigationPage.fillVmName('test-reload');

      await test.step('Reload the page and verify the beforeunload dialog appears', async () => {
        let dialogShown = false;
        page.once('dialog', async (dialog) => {
          dialogShown = true;
          expect(dialog.type(), 'Dialog should be a beforeunload prompt').toBe('beforeunload');
          await dialog.accept();
        });

        await page.reload();

        expect(dialogShown, 'Browser beforeunload dialog should have been triggered').toBe(true);
      });
    });

    test('Browser back button triggers exit modal on a dirty wizard', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
      page,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();
      await vmWizardNavigationPage.fillVmName('test-back-btn');

      await test.step('Press browser back and verify the exit modal appears', async () => {
        await page.goBack();

        const modalVisible = await vmWizardNavigationPage.isExitModalVisible();
        expect(modalVisible, 'Exit modal should appear on browser back with dirty form').toBe(true);
      });

      await test.step('Confirm exit via "Exit without saving"', async () => {
        await vmWizardNavigationPage.clickExitWithoutSaving();

        const wizardClosed = await vmWizardNavigationPage.verifyWizardClosed();
        expect(wizardClosed, 'Wizard should close after confirming exit').toBe(true);
      });
    });

    test('Successful VM creation completes without showing the exit modal', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-exit-create');

      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Complete the wizard flow using a template', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();

        await vmWizardNavigationPage.selectTemplateByTestId(RHEL9_TEMPLATE);
        await vmWizardNavigationPage.clickNext();
        await vmWizardNavigationPage.clickNext();
        await vmWizardNavigationPage.clickCreateVm();
      });

      await test.step('Verify VM is created and no exit modal was shown', async () => {
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);

        const createdVmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        apiClient.trackResource('VirtualMachine', createdVmName, wizardNs);

        const result = await apiClient.verifyVmCreated(createdVmName, wizardNs);
        expect.soft(result.exists, `VM '${createdVmName}' should exist`).toBe(true);
      });
    });
  },
);
