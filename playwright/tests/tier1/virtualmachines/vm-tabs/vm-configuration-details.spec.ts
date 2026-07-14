import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'Test VM Configuration tab';

test.describe.serial('VM Configuration — stopped RHEL9 VM', { tag: [T1_TAG, '@nonpriv'] }, () => {
  let ns: string;
  let stoppedVm: string;
  let setupError: string | undefined;

  test.beforeAll(async ({ k8sClient, utils }) => {
    try {
      ns = utils.generateTestNamespace('vm-cfg-stopped');
      await k8sClient.createNamespace(ns);
      await k8sClient.waitForNamespaceReady(ns);
      k8sClient.trackResource('Namespace', ns);

      stoppedVm = utils.generateRandomVmName('vm-cfg-stopped');
      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        stoppedVm,
        ns,
        'openshift',
        false,
      );
      k8sClient.trackResource('VirtualMachine', stoppedVm, ns);

      const result = await k8sClient.verifyVmCreated(stoppedVm, ns, utils.TestTimeouts.VM_BOOTUP);
      if (!result.exists) throw new Error(`VM ${stoppedVm} was not created`);
    } catch (error: unknown) {
      setupError = error instanceof Error ? error.message : String(error);
    }
  });

  test.beforeEach(async ({ utils }) => {
    test.skip(!!setupError, `Shared setup failed: ${setupError}`);
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
  });

  test('Configuration search finds SSH on a stopped VM', async ({ vmDetailPage }) => {
    await vmDetailPage.navigateToVirtualMachineDetail(stoppedVm, ns);
    await vmDetailPage.navigateToConfigurationDetails();

    const searchResult = await vmDetailPage.searchConfiguration('SSH', 'SSH');
    expect.soft(searchResult, 'Configuration search should find SSH').toBe(true);
  });

  test('Configuration sub-tabs show scheduling, eviction, headless, and boot mode', async ({
    vmDetailPage,
  }) => {
    await vmDetailPage.navigateToVirtualMachineDetail(stoppedVm, ns);

    await vmDetailPage.navigateToConfigurationScheduling();

    const schedulingVisible = await vmDetailPage.verifySchedulingAndResourceRequirements();
    expect
      .soft(
        schedulingVisible,
        'Configuration Scheduling should show scheduling and resource requirements',
      )
      .toBe(true);

    const evictionVisible = await vmDetailPage.verifyEvictionStrategyLiveMigrate();
    expect
      .soft(evictionVisible, 'Default RHEL9 template should show LiveMigrate eviction strategy')
      .toBe(true);

    await vmDetailPage.navigateToConfigurationDetails();

    const headlessModeVisible = await vmDetailPage.verifyHeadlessMode();
    expect
      .soft(headlessModeVisible, 'Configuration Details should show headless mode setting')
      .toBe(true);

    const configDetailsValid = await vmDetailPage.verifyConfigurationDetails(stoppedVm);
    expect
      .soft(
        configDetailsValid,
        'Configuration Details should show description and boot mode sections',
      )
      .toBe(true);
  });

  test('Edit description, boot mode, hostname, workload, and headless on stopped VM', async ({
    k8sClient,
    vmDetailPage,
    utils,
  }) => {
    await vmDetailPage.navigateToVirtualMachineDetail(stoppedVm, ns);
    await vmDetailPage.navigateToConfigurationDetails();

    await vmDetailPage.editDetails(stoppedVm, {
      description: 'edit vm details',
      bootMode: 'UEFI (secure)',
      hostname: utils.VM_CUSTOMIZATION.EDIT_HOSTNAME,
      workload: 'High performance',
      headless: true,
    });

    await k8sClient.startVm(stoppedVm, ns);
    await utils.waitForVirtualMachineReady(k8sClient, stoppedVm, ns, utils.TestTimeouts.VM_BOOTUP);

    const vm = (await k8sClient.getVirtualMachine(stoppedVm, ns)) as {
      metadata?: { annotations?: Record<string, string> };
      spec?: { template?: { spec?: Record<string, unknown> } };
    };
    const vmSpec = vm.spec?.template?.spec;

    expect
      .soft(
        vm.metadata?.annotations?.['description'],
        'VM description annotation should match the value set in Details tab',
      )
      .toBe('edit vm details');
    expect
      .soft(
        (vmSpec as { hostname?: string })?.hostname,
        'VM hostname in spec should match the value set in Details tab',
      )
      .toBe(utils.VM_CUSTOMIZATION.EDIT_HOSTNAME);
    expect
      .soft(
        (vmSpec as { domain?: { devices?: { autoattachGraphicsDevice?: boolean } } })?.domain
          ?.devices?.autoattachGraphicsDevice,
        'Headless mode should disable auto-attach graphics device in VM spec',
      )
      .toBe(false);
    expect
      .soft(
        (
          vmSpec as {
            domain?: { firmware?: { bootloader?: { efi?: { secureBoot?: boolean } } } };
          }
        )?.domain?.firmware?.bootloader?.efi?.secureBoot,
        'VM boot mode should be UEFI Secure Boot when set in Details tab',
      )
      .toBe(true);
  });
});

test.describe.serial('VM Configuration — running RHEL9 VM', { tag: [T1_TAG, '@nonpriv'] }, () => {
  let ns: string;
  let runningVm: string;
  let setupError: string | undefined;

  test.beforeAll(async ({ k8sClient, utils }) => {
    try {
      ns = utils.generateTestNamespace('vm-cfg-running');
      await k8sClient.createNamespace(ns);
      await k8sClient.waitForNamespaceReady(ns);
      k8sClient.trackResource('Namespace', ns);

      runningVm = utils.generateRandomVmName('vm-cfg-running');
      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        runningVm,
        ns,
        'openshift',
        true,
      );
      k8sClient.trackResource('VirtualMachine', runningVm, ns);

      await utils.waitForVirtualMachineReady(
        k8sClient,
        runningVm,
        ns,
        utils.TestTimeouts.VM_BOOTUP,
      );
    } catch (error: unknown) {
      setupError = error instanceof Error ? error.message : String(error);
    }
  });

  test.beforeEach(async ({ utils }) => {
    test.skip(!!setupError, `Shared setup failed: ${setupError}`);
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
  });

  test('Running VM shows Server workload and pc-q35 in configuration details', async ({
    vmDetailPage,
  }) => {
    await vmDetailPage.navigateToVirtualMachineDetail(runningVm, ns);
    await vmDetailPage.navigateToConfigurationDetails();

    const configDetailsValid = await vmDetailPage.verifyConfigurationDetails('Server');
    expect
      .soft(configDetailsValid, 'Configuration details should show Server workload and pc-q35')
      .toBe(true);

    const hasVnuma = await vmDetailPage.verifyVnumaBadge();
    test.info().annotations.push({
      type: 'vnuma-check',
      description: hasVnuma
        ? 'vNUMA badge is visible in CPU/Memory section'
        : 'vNUMA badge not visible (VM may not have NUMA topology configured)',
    });
  });

  test('Edit description, boot mode, workload, and headless on running VM', async ({
    vmDetailPage,
  }) => {
    await vmDetailPage.navigateToVirtualMachineDetail(runningVm, ns);
    await vmDetailPage.navigateToConfigurationDetails();

    await vmDetailPage.editDetails(runningVm, { description: 'edit vm details' });
    const descriptionVerified = await vmDetailPage.verifyDescription(runningVm, 'edit vm details');
    expect.soft(descriptionVerified, 'VM description should be changed').toBe(true);

    await vmDetailPage.editDetails(runningVm, { bootMode: 'UEFI (secure)' });
    const bootModeVerified = await vmDetailPage.verifyBootMode(runningVm, 'UEFI (secure)');
    expect.soft(bootModeVerified, 'VM bootMode should be changed').toBe(true);

    await vmDetailPage.editDetails(runningVm, { workload: 'High performance' });
    const workloadVerified = await vmDetailPage.verifyWorkload(runningVm, 'High performance');
    expect.soft(workloadVerified, 'VM workload should be changed').toBe(true);

    await vmDetailPage.editDetails(runningVm, { headless: true });
    const headlessVerified = await vmDetailPage.verifyHeadlessChecked(true);
    expect.soft(headlessVerified, 'VM headless mode should be enabled').toBe(true);

    const consoleNotVisible = await vmDetailPage.verifyConsoleNotVisible();
    expect
      .soft(
        consoleNotVisible,
        'Console section should not be visible when headless mode is enabled',
      )
      .toBe(true);
  });

  test('Add CD-ROM "Upload new ISO" has no separate Upload Mode selector', async ({
    vmDetailPage,
  }) => {
    await vmDetailPage.navigateToVirtualMachineDetail(runningVm, ns);
    await vmDetailPage.navigateToConfigurationStorage();

    await test.step('Verify Add CD-ROM modal has unified radio buttons', async () => {
      const modalOptions = await vmDetailPage.getCDROMModalOptions();

      expect
        .soft(
          modalOptions.radioLabels,
          'Add CD-ROM modal should show three source options after CNV-81927 unification',
        )
        .toEqual(
          expect.arrayContaining(['Use existing ISO', 'Upload new ISO', 'Leave empty drive']),
        );

      expect
        .soft(modalOptions.defaultSelected, '"Use existing ISO" should be selected by default')
        .toBe('Use existing ISO');
    });

    await test.step('Verify "Upload new ISO" does NOT show a separate Upload Mode selector', async () => {
      const noUploadModeSelector = await vmDetailPage.verifyUploadNewISOHasNoUploadModeSelector();

      expect(
        noUploadModeSelector,
        [
          'Selecting "Upload new ISO" in the Add CD-ROM modal must NOT show a separate',
          'Upload Mode selector (DataVolume vs PVC). CNV-81927 fix removed this selector —',
          'uploads now always create DataVolumes.',
        ].join(' '),
      ).toBe(true);
    });
  });
});

test.describe('VM Configuration — hostname edit', { tag: [T1_TAG, '@nonpriv'] }, () => {
  test('VM hostname is changed on stopped VM', async ({ k8sClient, vmDetailPage, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });

    const namespace = utils.generateTestNamespace('vm-cfg-hostname');
    const vmName = utils.generateRandomVmName('vm-cfg-hostname');

    await k8sClient.createNamespace(namespace);
    await k8sClient.waitForNamespaceReady(namespace);
    k8sClient.trackResource('Namespace', namespace);

    await k8sClient.createVmFromTemplate(
      utils.TEMPLATE_METADATA_NAMES.RHEL9,
      vmName,
      namespace,
      'openshift',
      false,
    );
    k8sClient.trackResource('VirtualMachine', vmName, namespace);

    const verifyResult = await k8sClient.verifyVmCreated(
      vmName,
      namespace,
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect(verifyResult.exists, 'Test VM should be created').toBe(true);

    await vmDetailPage.navigateToVirtualMachineDetail(vmName, namespace);
    await vmDetailPage.navigateToConfigurationDetails();

    await vmDetailPage.editDetails(vmName, {
      hostname: utils.VM_CUSTOMIZATION.EDIT_HOSTNAME,
    });

    const hostnameVerified = await vmDetailPage.verifyHostname(
      vmName,
      utils.VM_CUSTOMIZATION.EDIT_HOSTNAME,
    );
    expect.soft(hostnameVerified, 'VM hostname should be changed').toBe(true);
  });
});
