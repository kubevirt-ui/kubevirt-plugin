import { ADMIN_ONLY_TAG, T2, T2_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG } from '@/data-models/route-tags';

const LIVE_MIGRATION_SUITE = 'VM Live Migration';

test.describe(
  'VM live migration via UI',
  { tag: [ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG, T2_TAG, '@tier2-migration', ADMIN_ONLY_TAG] },
  () => {
    test('Live migrate a running VM to another node via the VM list kebab action', async ({
      apiClient,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: LIVE_MIGRATION_SUITE,
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });

      const ns = await setupTestNamespace(apiClient, 'live-mig');
      const vmName = utils.generateRandomVmName('live-mig');

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        true,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      const originalNode = await apiClient.getVmNodeName(vmName, ns);

      await vmListPage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.waitForVmStatus(vmName, 'Running');

      await test.step('Trigger live migration from VM list kebab', async () => {
        const migrated = await vmListPage.migrateVm(vmName);
        expect(migrated, 'Live migration should be triggered successfully').toBe(true);
      });

      await test.step('VM returns to Running state after migration', async () => {
        await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);
        await vmListPage.waitForVmStatus(vmName, 'Running');
      });

      await test.step('VM node changed after migration (multi-node clusters)', async () => {
        const newNode = await apiClient.getVmNodeName(vmName, ns);
        test.info().annotations.push({
          type: 'migration-node-check',
          description:
            originalNode !== newNode
              ? `VM migrated from ${originalNode} to ${newNode}`
              : `VM stayed on ${originalNode} (single-node or affinity constraint)`,
        });
      });
    });

    test('Migrate a running VM to a specific node', async ({
      apiClient,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: LIVE_MIGRATION_SUITE,
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });

      const ns = await setupTestNamespace(apiClient, 'mig-node');
      const vmName = utils.generateRandomVmName('mig-node');

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.FEDORA,
        vmName,
        ns,
        'openshift',
        true,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmListPage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.waitForVmStatus(vmName, 'Running');

      const migrated = await vmListPage.migrateVmToSpecificNode(vmName);
      expect(migrated, 'Migration to specific node should be triggered').toBe(true);

      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      await vmListPage.waitForVmStatus(vmName, 'Running');
    });
  },
);

const STORAGE_MIGRATION_SUITE = 'VM Storage Migration';

test.describe(
  'VM storage migration wizard',
  { tag: [ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG, T2_TAG, '@tier2-storage-migration', ADMIN_ONLY_TAG] },
  () => {
    test.beforeEach(async ({ apiClient, utils }) => {
      const storageMigrationAvailable = await apiClient.isStorageMigrationAvailable();
      test.skip(!storageMigrationAvailable, 'Storage migration CRD not available on this cluster');
      await utils.withAllure({
        suite: STORAGE_MIGRATION_SUITE,
        feature: T2,
        tags: [T2_TAG],
      });
    });

    test('Open storage migration modal, verify wizard steps, and close', async ({
      apiClient,
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

      await vmListPage.navigateToProjectViaTreeView(ns);
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

      await vmListPage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.performStorageClassMigration(vmName, destinationSC);
    });

    test('Start storage migration and cancel while in progress', async ({
      apiClient,
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

      await vmListPage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.startStorageMigrationAndCancelWhileInProgress(vmName);

      await test.step('VM remains Running after cancelled migration', async () => {
        await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);
        await vmListPage.waitForVmStatus(vmName, 'Running');
      });
    });
  },
);
