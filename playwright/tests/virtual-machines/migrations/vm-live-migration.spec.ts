import { ADMIN_ONLY_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { VmTabTestId } from '@/utils/constants';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`Live migration ${ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9365) Monitor VMI live migration from VM overview', async ({
    vmDetailPage: vmDetail,
    testNamespace,
    apiClient,
  }) => {
    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const vmName = generateRandomVmName('migrate').slice(0, 50);

    await apiClient.deleteVirtualMachine(vmName, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, vmName);

    const schedulableNodes = await apiClient.getSchedulableNodeCount();
    test.skip(
      schedulableNodes < 2,
      `Live migration requires at least 2 schedulable nodes (found ${schedulableNodes})`,
    );

    try {
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.startVmFromActions();
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.VM_BOOTUP,
      });
      await apiClient.waitForVmReadyToMigrate(
        testNamespace,
        vmName,
        TestTimeouts.MIGRATION_VM_READY,
      );
      await vmDetail.waitForMigrateActionEnabled(TestTimeouts.MIGRATION_VM_READY, async () => {
        await vmDetail.openVm(testNamespace, vmName);
      });

      await vmDetail.migrateFromActions();

      const [sawPopover] = await Promise.all([
        vmDetail.observeMigrationPopoverDuringMigration(),
        apiClient.waitForVmiMigrationComplete(testNamespace, vmName),
      ]);

      if (!sawPopover) {
        await vmDetail.goToTab(VmTabTestId.Events);
        await expect(vmDetail.eventsMigrationText()).toBeVisible({ timeout: 2 * MINUTE });
      }

      await vmDetail.goToTab(VmTabTestId.Overview);
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
