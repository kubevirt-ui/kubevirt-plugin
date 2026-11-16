import { GATING_TAG, GATING } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-actions-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(
  'Tier1 VM Start/Stop/Restart Lifecycle',
  { tag: [GATING_TAG, '@tier1-vm-actions'] },
  () => {
    test(
      'Start, stop, and restart a VM from the detail page actions dropdown',
      { tag: ['@nonpriv'] },
      async ({ vmDetailPage, vmTreePage, apiClient, utils }) => {
        test.setTimeout(TestTimeouts.TEST_EXTENDED);
        const SUITE = 'VM Lifecycle';
        await utils.withAllure({
          suite: SUITE,
          feature: GATING,
          tags: [GATING_TAG, '@tier1-vm-actions'],
        });

        const ns = utils.generateTestNamespace('lifecycle');
        await apiClient.createNamespace(ns);
        await apiClient.waitForNamespaceReady(ns);
        apiClient.trackResource('Namespace', ns);

        const vmName = utils.generateRandomVmName('lifecycle');
        // Cirros containerDisk — no CDI clone race under parallel gating workers.
        await apiClient.createCirrosVm(ns, vmName, false);
        apiClient.trackResource('VirtualMachine', vmName, ns);

        const created = await apiClient.verifyVmCreated(vmName, ns, TestTimeouts.VM_CREATION);
        expect(created.exists, 'VM should be created before lifecycle test').toBe(true);

        await test.step('Navigate to VM detail via tree view', async () => {
          await vmTreePage.navigateToVmViaTreeView(ns, vmName);
          await vmDetailPage.navigateToOverview();
        });

        await test.step('Start VM and verify Running status', async () => {
          await vmDetailPage.startVmFromActionsDropdown();
          await apiClient.waitForVmRunning(vmName, ns, TestTimeouts.VM_BOOTUP);
          await vmDetailPage.waitForVmOverviewStatusContains(
            'Running',
            TestTimeouts.UI_ACTION_COMPLETE,
          );
          const isRunning = await vmDetailPage.verifyVmOverviewStatus('Running');
          expect.soft(isRunning, 'VM should reach Running status after start').toBe(true);
        });

        await test.step('Stop VM and verify Stopped status', async () => {
          await vmDetailPage.stopVmFromActionsDropdown();
          await apiClient.waitForVmStopped(vmName, ns, TestTimeouts.VM_BOOTUP);
          await vmDetailPage.waitForVmOverviewStatusContains(
            'Stopped',
            TestTimeouts.UI_ACTION_COMPLETE,
          );
          const isStopped = await vmDetailPage.verifyVmOverviewStatus('Stopped');
          expect.soft(isStopped, 'VM should reach Stopped status after stop').toBe(true);
        });

        await test.step('Start VM again and verify Running status', async () => {
          await vmDetailPage.startVmFromActionsDropdown();
          await apiClient.waitForVmRunning(vmName, ns, TestTimeouts.VM_BOOTUP);
          await vmDetailPage.waitForVmOverviewStatusContains(
            'Running',
            TestTimeouts.UI_ACTION_COMPLETE,
          );
          const isRunningAgain = await vmDetailPage.verifyVmOverviewStatus('Running');
          expect
            .soft(isRunningAgain, 'VM should reach Running status after second start')
            .toBe(true);
        });
      },
    );
  },
);
