import { GATING_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import {
  CRUD_NAMES,
  VM_DETAIL_SIDEBAR_YAML_TABS,
  VM_FOLDER_LABEL,
  VmTabTestId,
} from '@/utils/constants';
import { generateRandomFolderName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';
import { withExampleVm } from '@/utils/with-example-vm';

test.describe(`VM detail tabs ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('VM example YAML and tabs load', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVmAndWaitForDetail(testNamespace, name);
      await expect(vmDetail.hostnameLabel()).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });

      await vmDetail.startVmFromActions();
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });

      await vmDetail.goToTab(VmTabTestId.Details);
      await expect(vmDetail.tabPanelText('VirtualMachine Details')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Metrics);
      await expect(vmDetail.tabPanelText('Utilization')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.YAML);
      await expect(vmDetail.tabPanelText('Download')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Scheduling);
      await expect(vmDetail.tabPanelText('Scheduling and resource requirements')).toBeVisible();
      await vmDetail.goToEnvironmentTab();
      await expect(vmDetail.environmentSectionHeading()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Events);
      await expect(vmDetail.eventsTabContent()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Console);
      await expect(vmDetail.consoleTabContent()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Networks);
      await expect(vmDetail.tabPanelText('Pod networking')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Disks);
      await expect(vmDetail.tabPanelText('rootdisk')).toBeVisible();
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });

  test('Running VM overview shows VNC console and Open web console link', async ({
    apiClient,
    page,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVmAndWaitForDetail(testNamespace, name);
      await vmDetail.startVmFromActions();
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });

      await expect(vmDetail.overviewVncConsoleTitle()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await vmDetail.ensureOverviewVncConnected();
      await expect(vmDetail.openWebConsoleButton()).toBeEnabled();

      const standalone = await vmDetail.openWebConsoleStandalonePage();
      await expect(standalone).toHaveURL(/\/console\/standalone/, {
        timeout: TestTimeouts.LONG_OPERATION,
      });
      if (standalone !== page) {
        await standalone.close();
      } else {
        await vmDetail.openVm(testNamespace, name);
      }
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});

test.describe(`VM detail sidebar YAML editor ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('Toggle sidebar YAML on configuration tabs', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);

      let toggledYaml = false;
      for (const tabId of VM_DETAIL_SIDEBAR_YAML_TABS) {
        if (!(await vmDetail.goToTabWithSidebarYamlEditor(tabId))) {
          continue;
        }
        await vmDetail.toggleYamlSidebarEditor();
        toggledYaml = true;
      }
      if (!toggledYaml) {
        await vmDetail.goToTab(VmTabTestId.YAML);
        await expect(vmDetail.tabPanelText('Download')).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
      }
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM Snapshots and Diagnostics tabs ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('Snapshots and Diagnostics tabs load', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.goToTab(VmTabTestId.Snapshots);
      await expect(vmDetail.snapshotsTabContent()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await vmDetail.goToTab(VmTabTestId.Diagnostics);
      await expect(vmDetail.diagnosticsTabContent()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM Metrics tab read ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('Metrics tab shows utilization section', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.goToTab(VmTabTestId.Metrics);
      await expect(vmDetail.tabPanelText('Utilization')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM Scheduling tab ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test('Scheduling tab shows resource requirements', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.goToTab(VmTabTestId.Scheduling);
      await expect(vmDetail.tabPanelText('Scheduling and resource requirements')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM Scripts tab ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test('ID(CNV-8956) Scripts tab shows cloud-init section', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await expect
        .poll(() => vmDetail.currentUrl())
        .toMatch(vmDetail.vmDetailUrlPattern(testNamespace, name));
      await expect(vmDetail.detailHeading()).toContainText(name);
      await vmDetail.goToTab(VmTabTestId.Scripts);
      await expect(vmDetail.scriptsTabHeading()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await expect(vmDetail.scriptsCloudInitText()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM storage empty CD-ROM ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('Add empty CD-ROM from configuration storage (advanced CD-ROM preview)', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
    vmDetailTabsPage: tabs,
  }) => {
    await withExampleVm(apiClient, testNamespace, async (name) => {
      await vmDetail.openVm(testNamespace, name);
      await expect(vmDetail.overviewStatusWithText('Stopped')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await tabs.openDisksTab(vmDetail);
      const cdRomRowsBefore = await tabs.cdRomStorageRow().count();
      await tabs.openAddCdRomModal();
      await tabs.ensureUploadIsoToClusterUnchecked();
      await expect(tabs.uploadIsoToClusterCheckbox()).not.toBeChecked();
      await expect(tabs.addCdRomSubmitButton()).toBeEnabled({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      const cdRomDiskName = (await tabs.cdRomDiskNameInput().inputValue()).trim();
      expect(cdRomDiskName.length).toBeGreaterThan(0);
      await tabs.confirmAddCdRomModal();
      await expect(tabs.cdRomStorageRow()).toHaveCount(cdRomRowsBefore + 1);
      await expect
        .poll(
          async () => {
            const vm = await apiClient.getVirtualMachine(testNamespace, name);
            const disks = vm?.spec?.template?.spec?.domain?.devices?.disks ?? [];
            const volumes = vm?.spec?.template?.spec?.volumes ?? [];
            const cdDisk = disks.find((disk) => disk.name === cdRomDiskName && disk.cdrom);
            if (!cdDisk) {
              return false;
            }
            return !volumes.some((volume) => volume.name === cdRomDiskName);
          },
          {
            message: `VirtualMachine ${name} should have empty CD-ROM device ${cdRomDiskName} (no volume)`,
            timeout: TestTimeouts.LONG_OPERATION,
          },
        )
        .toBe(true);
    });
  });
});

test.describe(`VM move to folder ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('Move example VM to a new folder via Actions (tree folders preview)', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const folderName = generateRandomFolderName();
    await withExampleVm(apiClient, testNamespace, async (name) => {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.waitForDetailHeadingVmName(name);
      await vmDetail.moveVmToNewFolder(folderName);
      await expect
        .poll(async () => (await vmDetail.overviewFolderValue().textContent())?.trim() ?? '', {
          message: `Overview Folder field should show ${folderName}`,
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(folderName);
      await expect
        .poll(
          async () => {
            const vm = await apiClient.getVirtualMachine(testNamespace, name);
            return vm?.metadata?.labels?.[VM_FOLDER_LABEL];
          },
          {
            message: `VirtualMachine ${name} should have folder label ${VM_FOLDER_LABEL}=${folderName}`,
            timeout: TestTimeouts.LONG_OPERATION,
          },
        )
        .toBe(folderName);
    });
  });
});
