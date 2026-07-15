import { T2, T2_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

test.describe('VM full lifecycle: start, pause, unpause, restart, stop', { tag: [T2_TAG] }, () => {
  test(
    'VM lifecycle transitions through all states via actions dropdown',
    { tag: ['@nonpriv'] },
    async ({ k8sClient, vmListPage, vmDetailPage, pageCommons, utils, testConfig }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: 'VM lifecycle actions',
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG, '@nonpriv'],
      });

      const namespace = utils.EnvVariables.isNonPrivUser
        ? testConfig.testNamespace
        : utils.generateTestNamespace('vm-lifecycle');
      const vmName = utils.generateRandomVmName('vm-lifecycle');
      if (!utils.EnvVariables.isNonPrivUser) {
        await k8sClient.createNamespace(namespace);
        await k8sClient.waitForNamespaceReady(namespace);
        k8sClient.trackResource('Namespace', namespace);
      }

      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.FEDORA,
        vmName,
        namespace,
        'openshift',
        true,
      );
      k8sClient.trackResource('VirtualMachine', vmName, namespace);
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await k8sClient.stopVm(vmName, namespace);
      await utils.waitForVirtualMachineStopped(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await vmListPage.navigateToAllNamespacesVirtualMachines();
      await vmListPage.tryCloseWelcomeModal();
      await vmListPage.toggleEmptyProjectsDisplay(true);
      await vmListPage.searchTreeView(namespace);
      await vmListPage.clickProjectNode(namespace);
      await vmListPage.clickVmListTab();
      await vmListPage.clickVmByTestId(vmName);

      const isStopped = await pageCommons.waitForStatusText('Stopped');
      expect.soft(isStopped, 'VM should be stopped initially').toBe(true);

      await vmDetailPage.startVmFromActionsDropdown();
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      const isRunningAfterStart = await pageCommons.waitForStatusText('Running');
      expect.soft(isRunningAfterStart, 'VM should be running after start').toBe(true);

      await vmDetailPage.pauseVmFromActionsDropdown();
      await utils.waitForVirtualMachinePaused(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      const isPaused = await pageCommons.waitForStatusText('Paused');
      expect.soft(isPaused, 'VM should be paused').toBe(true);

      await vmDetailPage.unpauseVmFromActionsDropdown();
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      const isRunningAfterUnpause = await pageCommons.waitForStatusText('Running');
      expect.soft(isRunningAfterUnpause, 'VM should be running after unpause').toBe(true);

      await vmDetailPage.restartVmFromActionsDropdown();
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      const isRunningAfterRestart = await pageCommons.waitForStatusText('Running');
      expect.soft(isRunningAfterRestart, 'VM should be running after restart').toBe(true);

      await vmDetailPage.stopVmFromActionsDropdown();
      await utils.waitForVirtualMachineStopped(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      const isStoppedFinally = await pageCommons.waitForStatusText('Stopped');
      expect.soft(isStoppedFinally, 'VM should be stopped').toBe(true);
    },
  );
});

test.describe('VM Configuration — startInPause and CPU/memory lifecycle', { tag: [T2_TAG] }, () => {
  test(
    'Headless mode toggle and startInPause on Fedora VM',
    { tag: ['@nonpriv'] },
    async ({ k8sClient, vmTreePage, vmDetailPage, pageCommons, utils, testConfig }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: 'VM Configuration lifecycle',
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });

      const namespace = utils.EnvVariables.isNonPrivUser
        ? testConfig.testNamespace
        : utils.generateTestNamespace('vm-cfg-fedora');
      const vmName = utils.generateRandomVmName('vm-cfg-fedora');

      if (!utils.EnvVariables.isNonPrivUser) {
        await k8sClient.createNamespace(namespace);
        await k8sClient.waitForNamespaceReady(namespace);
        k8sClient.trackResource('Namespace', namespace);
      }

      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.FEDORA,
        vmName,
        namespace,
        'openshift',
        true,
      );
      k8sClient.trackResource('VirtualMachine', vmName, namespace);
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await vmTreePage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.navigateToConfigurationDetails();

      await vmDetailPage.editDetails(vmName, { headless: true });

      const headlessEnabled = await vmDetailPage.verifyHeadlessChecked(true);
      expect
        .soft(headlessEnabled, 'VM headless mode should be enabled after setting it')
        .toBe(true);

      await vmDetailPage.editDetails(vmName, { headless: false });

      const headlessDisabled = await vmDetailPage.verifyHeadlessChecked(false);
      expect.soft(headlessDisabled, 'VM headless mode should be disabled (restored)').toBe(true);

      await vmDetailPage.editDetails(vmName, { startInPause: true });
      await vmDetailPage.clickRestartButton();
      await vmTreePage.searchTreeView(namespace);
      await vmTreePage.clickTreeNodeAndEnsureExpanded(namespace, vmName, namespace);
      await vmTreePage.clickVmInTreeView(vmName, namespace);
      await utils.waitForVirtualMachinePaused(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await vmDetailPage.navigateToOverview();

      const isPaused = await pageCommons.waitForStatusText('Paused');
      expect.soft(isPaused, 'VM should be started in pause mode').toBe(true);
    },
  );

  test(
    'Increase CPU and memory, restart VM, and verify VMI reflects changes',
    { tag: ['@nonpriv'] },
    async ({ k8sClient, vmTreePage, vmDetailPage, utils, testConfig }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: 'VM Configuration lifecycle',
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });

      const namespace = utils.EnvVariables.isNonPrivUser
        ? testConfig.testNamespace
        : utils.generateTestNamespace('vm-cfg-cpu');
      const vmName = utils.generateRandomVmName('vm-cfg-cpu');

      if (!utils.EnvVariables.isNonPrivUser) {
        await k8sClient.createNamespace(namespace);
        await k8sClient.waitForNamespaceReady(namespace);
        k8sClient.trackResource('Namespace', namespace);
      }

      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        namespace,
        'openshift',
        true,
      );
      k8sClient.trackResource('VirtualMachine', vmName, namespace);
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await vmTreePage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.navigateToConfigurationDetails();
      await vmDetailPage.increaseCpuAndMemory();

      await k8sClient.stopVm(vmName, namespace);
      await utils.waitForVirtualMachineStopped(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_RUNNING,
      );
      await k8sClient.startVm(vmName, namespace);
      await utils.waitForVirtualMachineReady(
        k8sClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_RUNNING,
      );

      const cpuSockets = await k8sClient.getVmiCpuSockets(vmName, namespace);
      expect.soft(cpuSockets, 'VMI CPU sockets should be 2').toBe('2');

      const memoryGuest = await k8sClient.getVmiMemoryGuest(vmName, namespace);
      expect.soft(memoryGuest, 'VMI memory guest should contain 3Gi').toContain('3Gi');
    },
  );
});
