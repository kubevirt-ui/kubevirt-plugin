import { ADMIN_ONLY_TAG, MIGRATION_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/migration-main-fixture';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';

const SUITE = `VM compute migration ${ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG} ${MIGRATION_TAG} ${ADMIN_ONLY_TAG}`;

test.describe(`${SUITE} compute action`, () => {
  test('VM compute migration action matches cluster schedulable node count', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const isSno = await apiClient.isClusterSingleNode();

    const vmName = generateRandomVmName('migrate-topology').slice(0, 50);
    await apiClient.deleteVirtualMachine(vmName, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, vmName);
    await apiClient.startVirtualMachine(testNamespace, vmName);

    try {
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.waitForDetailHeadingVmName(vmName);

      if (isSno) {
        const enabled = await vmDetail.isMigrateActionEnabledInMenu();
        expect(enabled, 'Compute migration should be disabled on single-node clusters').toBe(false);
        return;
      }

      await apiClient.waitForVmReadyToMigrate(
        testNamespace,
        vmName,
        TestTimeouts.MIGRATION_VM_READY,
      );
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.waitForDetailHeadingVmName(vmName);
      // Clear "Not migratable" chrome before probing Actions (stale watch after API ready).
      await vmDetail.waitForConsoleLiveMigratable(TestTimeouts.MIGRATION_VM_READY, async () => {
        await vmDetail.openVm(testNamespace, vmName);
        await vmDetail.waitForDetailHeadingVmName(vmName);
      });

      // Single poll: console status + Actions → Migration → Compute.
      // Refresh detail periodically so the Actions menu picks up condition changes.
      let enabled = false;
      const reloadIntervalMs = 20_000;
      let lastReload = Date.now();
      await pollUntil(
        async () => {
          if (Date.now() - lastReload >= reloadIntervalMs) {
            await vmDetail.openVm(testNamespace, vmName);
            await vmDetail.waitForDetailHeadingVmName(vmName);
            lastReload = Date.now();
          }
          const status = await vmDetail
            .overviewStatus()
            .textContent()
            .catch(() => '');
          if (!/Running/i.test(status ?? '')) {
            return false;
          }
          enabled = await vmDetail.isMigrateActionEnabledInMenu();
          return enabled;
        },
        {
          message: 'Compute migration should enable when the VM is live-migratable',
          timeout: TestTimeouts.MIGRATION_VM_READY,
        },
      );
      expect(enabled).toBe(true);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`${SUITE} target nodes`, () => {
  test('Compute migration modal lists candidate target nodes', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    // Manageable Tier1 scope: open the modal and assert node picker UI (no cordon/oc).
    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const isSno = await apiClient.isClusterSingleNode();

    const vmName = generateRandomVmName('migrate-nodes').slice(0, 50);
    await apiClient.deleteVirtualMachine(vmName, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, vmName);
    await apiClient.startVirtualMachine(testNamespace, vmName);

    try {
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.waitForDetailHeadingVmName(vmName);

      if (isSno) {
        const enabled = await vmDetail.isMigrateActionEnabledInMenu();
        expect(enabled, 'Compute migration should be disabled on single-node clusters').toBe(false);
        return;
      }

      await apiClient.waitForVmReadyToMigrate(
        testNamespace,
        vmName,
        TestTimeouts.MIGRATION_VM_READY,
      );
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.waitForDetailHeadingVmName(vmName);
      const refreshDetail = async () => {
        await vmDetail.openVm(testNamespace, vmName);
        await vmDetail.waitForDetailHeadingVmName(vmName);
      };
      await vmDetail.waitForConsoleLiveMigratable(TestTimeouts.MIGRATION_VM_READY, refreshDetail);
      await vmDetail.openComputeMigrationModal({
        refreshDetail,
        timeout: TestTimeouts.MIGRATION_VM_READY,
      });
      try {
        const visibleOptions = await vmDetail.getVisibleMigrationNodeOptionsFromOpenModal();
        expect(
          visibleOptions.length,
          'Compute migration modal should list at least one candidate node',
        ).toBeGreaterThan(0);
        const currentNode = await apiClient.getVirtualMachineInstanceNodeName(
          testNamespace,
          vmName,
        );
        if (currentNode) {
          expect
            .soft(visibleOptions, 'Current VM node is typically not offered as a migration target')
            .not.toContain(currentNode);
        }
      } finally {
        await vmDetail.closeComputeMigrationModal().catch(() => undefined);
      }
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
