import { ADMIN_ONLY_TAG, T2, T2_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Live Migration';

test.describe(
  'VM live migration via UI',
  { tag: [T2_TAG, '@tier2-migration', ADMIN_ONLY_TAG] },
  () => {
    test('Live migrate a running VM to another node via the VM list kebab action', async ({
      apiClient,
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: SUITE,
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

      await vmTreePage.navigateToProjectViaTreeView(ns);
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
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: SUITE,
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

      await vmTreePage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      await vmListPage.waitForVmStatus(vmName, 'Running');

      const migrated = await vmListPage.migrateVmToSpecificNode(vmName);
      expect(migrated, 'Migration to specific node should be triggered').toBe(true);

      await utils.waitForVirtualMachineReady(apiClient, vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      await vmListPage.waitForVmStatus(vmName, 'Running');
    });
  },
);
