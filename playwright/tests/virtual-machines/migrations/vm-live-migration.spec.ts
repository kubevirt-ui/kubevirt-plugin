import { ADMIN_ONLY_TAG, GATING_TAG, T2_TAG } from '@/data-models/allure-constants';
import {
  ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG,
  ROUTE_VIRTUALIZATION_LANDING_TAG,
} from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { VmTabTestId } from '@/utils/constants';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`Live migration on overview ${ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG} ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Running VM live migration appears on virtualization overview Migrations tab', async ({
    apiClient,
    nav,
    overviewPage,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const vmName = generateRandomVmName('migrate-gate').slice(0, 50);

    const schedulableNodes = await apiClient.getSchedulableNodeCount();
    test.skip(
      schedulableNodes < 2,
      `Live migration requires at least 2 schedulable nodes (found ${schedulableNodes})`,
    );

    await apiClient.deleteVirtualMachine(vmName, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, vmName);

    try {
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.waitForDetailHeadingVmName(vmName);
      await vmDetail.startVmFromActions();
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.VM_BOOTUP,
      });
      await apiClient.waitForVmReadyToMigrate(
        testNamespace,
        vmName,
        TestTimeouts.MIGRATION_VM_READY,
      );
      await apiClient.startLiveMigration(testNamespace, vmName);

      await nav.goToOverviewMigrations();
      await expect(overviewPage.migrationsHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
      await overviewPage.waitForVmInMigrationsTable(vmName);

      await apiClient.waitForVmiMigrationComplete(testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`Live migration ${ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9365) Monitor VMI live migration from VM overview', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const vmName = generateRandomVmName('migrate').slice(0, 50);

    await apiClient.deleteVirtualMachine(vmName, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, vmName);

    const schedulableNodes = await apiClient.getSchedulableNodeCount();
    expect(
      schedulableNodes,
      `Live migration requires at least 2 schedulable nodes (found ${schedulableNodes})`,
    ).toBeGreaterThanOrEqual(2);

    try {
      await vmDetail.openVm(testNamespace, vmName);
      await vmDetail.waitForDetailHeadingVmName(vmName);
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
