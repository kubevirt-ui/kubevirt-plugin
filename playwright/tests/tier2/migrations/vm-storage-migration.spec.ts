import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Storage Migration';

test.describe(
  'VM storage migration wizard',
  { tag: [T2_TAG, '@tier2-storage-migration', ADMIN_ONLY_TAG] },
  () => {
    test.beforeEach(async ({ apiClient, utils }) => {
      const storageMigrationAvailable = await apiClient.isStorageMigrationAvailable();
      test.skip(!storageMigrationAvailable, 'Storage migration CRD not available on this cluster');
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG],
      });
    });

    test('Open storage migration modal, verify wizard steps, and close', async ({
      apiClient,
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      const ns = await setupTestNamespace(apiClient, 'stor-mig-modal');
      const vmName = utils.generateRandomVmName('stor-mig');

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        true,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmTreePage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await test.step('Verify Migrate Storage action is enabled for running VM', async () => {
        const enabled = await vmListPage.isMigrateStorageActionEnabled(vmName);
        expect(enabled, 'Migrate Storage action should be enabled for a running VM').toBe(true);
      });

      await test.step('Open storage migration modal and verify it loads', async () => {
        await vmListPage.openStorageMigrationModal(vmName);
      });

      await test.step('Wizard nav steps are present', async () => {
        const volumeStepDisabled = await vmListPage.isWizardNavStepDisabled('StorageClass');
        expect
          .soft(
            volumeStepDisabled,
            'StorageClass step should be disabled before completing volume selection',
          )
          .toBe(true);
      });

      await test.step('Close modal without migrating', async () => {
        await vmListPage.closeMigrationModal();
      });
    });

    test('Perform full storage class migration and verify completion', async ({
      apiClient,
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      const storageClasses = await apiClient.getStorageClasses();
      const scNames = (storageClasses as { items?: Array<{ metadata?: { name?: string } }> })?.items
        ?.map((sc) => sc.metadata?.name)
        .filter(Boolean) as string[];
      const destinationSC =
        scNames?.find((n) => n === utils.STORAGE_CLASSES.VOL_DESTINATION) ?? scNames?.[0];
      test.skip(!destinationSC, 'No storage class available for migration');

      const ns = await setupTestNamespace(apiClient, 'stor-mig-full');
      const vmName = utils.generateRandomVmName('stor-mig-full');

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        true,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmTreePage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.performStorageClassMigration(vmName, destinationSC);
    });

    test('Start storage migration and cancel while in progress', async ({
      apiClient,
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      const ns = await setupTestNamespace(apiClient, 'stor-mig-cancel');
      const vmName = utils.generateRandomVmName('stor-mig-cancel');

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        true,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmTreePage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.startStorageMigrationAndCancelWhileInProgress(vmName);

      await test.step('VM remains Running after cancelled migration', async () => {
        await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);
        await vmListPage.waitForVmStatus(vmName, 'Running');
      });
    });
  },
);
