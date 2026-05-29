/**
 * CNV-87874: MigrationRequired pending changes alert on VM details.
 * Mirrors PR #3973 test plan — update NAD on a running VM and verify the alert.
 */
import { expect, test } from '../../fixtures';
import { MINUTE } from '../../utils/constants';
import { env } from '../../utils/env';
import { byTestId } from '../../utils/locators';
import {
  cleanupMigrationRequiredTestResources,
  createBridgeNAD,
  createVMWithBridgeMultusNIC,
  patchVMMultusNAD,
  waitForMigrationRequired,
  waitForVMRunning,
} from '../../utils/vm-pending-changes';

const NS = env.testNamespace;
const VM_NAME = NS ? `${NS}-migration-alert` : '';
const NAD_A = 'migration-e2e-nad-a';
const NAD_B = 'migration-e2e-nad-b';
const SECONDARY_NIC = 'secondary-nic';

test.describe.configure({ mode: 'serial' });

test.describe.skip('VM MigrationRequired pending changes alert', () => {
  test.beforeAll(() => {
    createBridgeNAD(NS, NAD_A);
    createBridgeNAD(NS, NAD_B);
    createVMWithBridgeMultusNIC(VM_NAME, NS, NAD_A, SECONDARY_NIC);
    waitForVMRunning(VM_NAME, NS);
  });

  test.afterAll(() => {
    cleanupMigrationRequiredTestResources(VM_NAME, NS, [NAD_A, NAD_B]);
  });

  test('shows Migration required alert after NAD change on a running VM', async ({
    page,
    vmDetails,
    vmList,
  }) => {
    patchVMMultusNAD(VM_NAME, NS, NAD_B);
    waitForMigrationRequired(VM_NAME, NS);

    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(VM_NAME, MINUTE),
      `VM "${VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);
    await vmList.openVM(VM_NAME);

    await vmDetails.expectMigrationRequiredAlert();
    await expect(page.getByText('The following areas have pending changes.')).toHaveCount(0);

    await vmDetails.goToConfigSubTab('network');
    await expect(byTestId(page, `nic-${SECONDARY_NIC}`).getByText('Pending')).toHaveCount(0);
  });
});
