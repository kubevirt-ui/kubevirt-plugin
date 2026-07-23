import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'Test VM Configuration tab';

test.describe.serial('VM Configuration — stopped RHEL9 VM', { tag: [T1_TAG, '@nonpriv'] }, () => {
  let ns: string;
  let stoppedVm: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    ns = utils.generateTestNamespace('vm-cfg-stopped');
    await apiClient.createNamespace(ns);
    await apiClient.waitForNamespaceReady(ns);
    apiClient.trackResource('Namespace', ns);

    stoppedVm = utils.generateRandomVmName('vm-cfg-stopped');
    await apiClient.createVmFromTemplate(
      utils.TEMPLATE_METADATA_NAMES.RHEL9,
      stoppedVm,
      ns,
      'openshift',
      false,
    );
    apiClient.trackResource('VirtualMachine', stoppedVm, ns);

    const result = await apiClient.verifyVmCreated(stoppedVm, ns, utils.TestTimeouts.VM_BOOTUP);
    if (!result.exists) throw new Error(`VM ${stoppedVm} was not created`);
  });

  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
  });

  test('Stopped VM configuration CRUD', async ({ apiClient, vmTreePage, vmDetailPage, utils }) => {
    await test.step('Verify configuration search finds SSH', async () => {
      await vmTreePage.navigateToVmViaTreeView(ns, stoppedVm);
      await vmDetailPage.navigateToConfigurationDetails();

      const searchResult = await vmDetailPage.searchConfiguration('SSH', 'SSH');
      expect.soft(searchResult, 'Configuration search should find SSH').toBe(true);
    });

    await test.step('Verify scheduling, eviction, headless, and boot mode sub-tabs', async () => {
      await vmTreePage.navigateToVmViaTreeView(ns, stoppedVm);
      await vmDetailPage.navigateToConfigurationScheduling();

      await expect
        .poll(async () => vmDetailPage.verifySchedulingAndResourceRequirements(), {
          timeout: 30_000,
          intervals: [3_000],
          message: 'Scheduling sub-tab should load',
        })
        .toBe(true);

      await vmDetailPage.navigateToConfigurationScheduling();
      await expect
        .poll(
          async () => {
            return (
              (await vmDetailPage.verifyEvictionStrategyLiveMigrate()) ||
              (await vmDetailPage.verifyEvictionStrategyNone())
            );
          },
          {
            timeout: 30_000,
            intervals: [3_000],
            message: 'Scheduling tab should display an eviction strategy setting',
          },
        )
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

    await test.step('Edit description, boot mode, hostname, workload, and headless', async () => {
      await vmTreePage.navigateToVmViaTreeView(ns, stoppedVm);
      await vmDetailPage.navigateToConfigurationDetails();

      await vmDetailPage.editDetails(stoppedVm, {
        description: 'edit vm details',
        bootMode: 'UEFI (secure)',
        hostname: utils.VM_CUSTOMIZATION.EDIT_HOSTNAME,
        workload: 'High performance',
        headless: true,
      });

      await apiClient.startVm(ns, stoppedVm);
      await utils.waitForVirtualMachineReady(
        apiClient,
        stoppedVm,
        ns,
        utils.TestTimeouts.VM_BOOTUP,
      );

      const vm = (await apiClient.getVirtualMachine(ns, stoppedVm)) as {
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

    await test.step('Verify hostname change via UI', async () => {
      await vmTreePage.navigateToVmViaTreeView(ns, stoppedVm);
      await vmDetailPage.navigateToConfigurationDetails();

      const hostnameVerified = await vmDetailPage.verifyHostname(
        stoppedVm,
        utils.VM_CUSTOMIZATION.EDIT_HOSTNAME,
      );
      expect.soft(hostnameVerified, 'VM hostname should be changed').toBe(true);
    });
  });
});

test.describe.serial('VM Configuration — running RHEL9 VM', { tag: [T1_TAG, '@nonpriv'] }, () => {
  let ns: string;
  let runningVm: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    ns = utils.generateTestNamespace('vm-cfg-running');
    await apiClient.createNamespace(ns);
    await apiClient.waitForNamespaceReady(ns);
    apiClient.trackResource('Namespace', ns);

    runningVm = utils.generateRandomVmName('vm-cfg-running');
    await apiClient.createVmFromTemplate(
      utils.TEMPLATE_METADATA_NAMES.RHEL9,
      runningVm,
      ns,
      'openshift',
      true,
    );
    apiClient.trackResource('VirtualMachine', runningVm, ns);

    await utils.waitForVirtualMachineReady(apiClient, runningVm, ns, utils.TestTimeouts.VM_BOOTUP);
  });

  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
  });

  test('Running VM configuration CRUD', async ({ vmTreePage, vmDetailPage }) => {
    await test.step('Verify workload and machine type in configuration details', async () => {
      await vmTreePage.navigateToVmViaTreeView(ns, runningVm);
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

    await test.step('Edit description, boot mode, workload, and headless', async () => {
      await vmTreePage.navigateToVmViaTreeView(ns, runningVm);
      await vmDetailPage.navigateToConfigurationDetails();

      await vmDetailPage.editDetails(runningVm, { description: 'edit vm details' });
      const descriptionVerified = await vmDetailPage.verifyDescription(
        runningVm,
        'edit vm details',
      );
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
  });

  test('Add CD-ROM "Upload new ISO" has no separate Upload Mode selector', async ({
    vmTreePage,
    vmDetailPage,
  }) => {
    await vmTreePage.navigateToVmViaTreeView(ns, runningVm);
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
