import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-actions-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(
  'Tier1 VM Start/Stop/Restart Lifecycle',
  { tag: [T1_TAG, '@tier1-vm-actions'] },
  () => {
    test(
      'Start, stop, and restart a VM from the detail page actions dropdown',
      { tag: ['@nonpriv'] },
      async ({ vmDetailPage, vmTreePage, apiClient, utils }) => {
        const SUITE = 'VM Lifecycle';
        await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, '@tier1-vm-actions'] });

        const ns = utils.generateTestNamespace('lifecycle');
        await apiClient.createNamespace(ns);
        await apiClient.waitForNamespaceReady(ns);
        apiClient.trackResource('Namespace', ns);

        const vmName = utils.generateRandomVmName('lifecycle');
        await apiClient.createVmFromTemplate(
          utils.TEMPLATE_METADATA_NAMES.RHEL9,
          vmName,
          ns,
          'openshift',
          false,
        );
        apiClient.trackResource('VirtualMachine', vmName, ns);

        const created = await apiClient.verifyVmCreated(vmName, ns, TestTimeouts.VM_BOOTUP);
        expect(created.exists, 'VM should be created before lifecycle test').toBe(true);

        await test.step('Navigate to VM detail via tree view', async () => {
          await vmTreePage.navigateToVmViaTreeView(ns, vmName);
          await vmDetailPage.navigateToOverview();
        });

        await test.step('Start VM and verify Running status', async () => {
          await vmDetailPage.startVmFromActionsDropdown();
          await vmDetailPage.waitForVmOverviewStatusContains('Running', TestTimeouts.VM_BOOTUP);
          const isRunning = await vmDetailPage.verifyVmOverviewStatus('Running');
          expect.soft(isRunning, 'VM should reach Running status after start').toBe(true);
        });

        await test.step('Stop VM and verify Stopped status', async () => {
          await vmDetailPage.stopVmFromActionsDropdown();
          await vmDetailPage.waitForVmOverviewStatusContains('Stopped', TestTimeouts.VM_BOOTUP);
          const isStopped = await vmDetailPage.verifyVmOverviewStatus('Stopped');
          expect.soft(isStopped, 'VM should reach Stopped status after stop').toBe(true);
        });

        await test.step('Start VM again and verify Running status', async () => {
          await vmDetailPage.startVmFromActionsDropdown();
          await vmDetailPage.waitForVmOverviewStatusContains('Running', TestTimeouts.VM_BOOTUP);
          const isRunningAgain = await vmDetailPage.verifyVmOverviewStatus('Running');
          expect
            .soft(isRunningAgain, 'VM should reach Running status after second start')
            .toBe(true);
        });
      },
    );
  },
);
