import { GATING_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VM_DETAIL_SIDEBAR_YAML_TABS, VmTabTestId } from '@/utils/constants';
import { isOpenShiftMajorMinor } from '@/utils/openshift-version';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Configuration sub-tabs React-crash under OC/console skew (HC OCP 4.18 +
 * origin-console:4.18 with a release-4.13 plugin: "Oh no! Something went wrong.").
 * Run Configuration-dependent UI only when live ClusterVersion is 4.13.
 */
const skipConfigurationUiUnlessOcp413 = () => {
  test.skip(
    !isOpenShiftMajorMinor('4.13'),
    'VM Configuration UI requires matching OCP 4.13 (skipped under OC/console skew)',
  );
};

test.describe(`VM detail tabs ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('VM example YAML and tabs load', async ({
    vmDetailPage: vmDetail,
    testNamespace,
    apiClient,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    const matching413 = isOpenShiftMajorMinor('4.13');

    try {
      await vmDetail.openVm(testNamespace, name);
      await expect(vmDetail.hostnameLabel()).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });

      const didStart = await vmDetail.startVmFromActions();
      if (didStart) {
        await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
          timeout: TestTimeouts.TEST_VM_CREATION,
        });
      } else {
        // Already started / Provisioning (Actions shows Stop) — do not wait for cold Start.
        await expect(
          vmDetail
            .overviewStatusWithText('Running')
            .or(vmDetail.overviewStatusWithText('Provisioning')),
        ).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
      }

      await vmDetail.goToTab(VmTabTestId.Details);
      await expect(vmDetail.tabPanelText('VirtualMachine Details')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Metrics);
      await expect(vmDetail.tabPanelText('Utilization')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.YAML);
      await expect(vmDetail.yamlTabContent()).toBeVisible();
      // Scheduling / Environment / Networks / Disks live under Configuration — skip on OC skew.
      if (matching413) {
        await vmDetail.goToTab(VmTabTestId.Scheduling);
        await expect(vmDetail.tabPanelText('Scheduling and resources requirements')).toBeVisible();
        await vmDetail.goToEnvironmentTab();
        await expect(vmDetail.environmentSectionHeading()).toBeVisible();
      }
      await vmDetail.goToTab(VmTabTestId.Events);
      await expect(vmDetail.eventsTabContent()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Console);
      await expect(vmDetail.consoleTabContent()).toBeVisible();
      if (matching413) {
        await vmDetail.goToTab(VmTabTestId.Networks);
        await expect(vmDetail.tabPanelText('Pod networking')).toBeVisible();
        await vmDetail.goToTab(VmTabTestId.Disks);
        await expect(vmDetail.tabPanelText('rootdisk')).toBeVisible();
      }
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});

test.describe(`VM detail sidebar YAML editor ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test.beforeEach(skipConfigurationUiUnlessOcp413);

  test('Toggle sidebar YAML on configuration tabs', async ({
    vmDetailPage: vmDetail,
    testNamespace,
    apiClient,
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
        await vmDetail.goToYamlTab();
        await expect(vmDetail.yamlTabContent()).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
      }
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM Metrics tab read ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T1_TAG}`, () => {
  test('Metrics tab shows utilization section', async ({
    vmDetailPage: vmDetail,
    testNamespace,
    apiClient,
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
  test.beforeEach(skipConfigurationUiUnlessOcp413);

  test('Scheduling tab shows resource requirements', async ({
    vmDetailPage: vmDetail,
    testNamespace,
    apiClient,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.goToTab(VmTabTestId.Scheduling);
      await expect(vmDetail.tabPanelText('Scheduling and resources requirements')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM Scripts tab ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test.beforeEach(skipConfigurationUiUnlessOcp413);

  test('ID(CNV-8956) Scripts tab shows cloud-init section', async ({
    vmDetailPage: vmDetail,
    testNamespace,
    apiClient,
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
