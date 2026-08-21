import { load as yamlLoad } from 'js-yaml';

import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_SEARCH_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/vm-search-fixture';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Project Filter';

const projectParams = (url: string): string[] => new URL(url).searchParams.getAll('project');

const isAllNamespacesPath = (url: string): boolean =>
  new URL(url).pathname.includes('/all-namespaces/');

test.describe(SUITE, { tag: [T1_TAG, VM_SEARCH_TAG] }, () => {
  let projectA: string;
  let projectB: string;
  let vmA: string;
  let vmB: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    projectA = await setupTestNamespace(apiClient, 'proj-a');
    projectB = await setupTestNamespace(apiClient, 'proj-b');

    vmA = utils.generateRandomVmName('vm-a');
    vmB = utils.generateRandomVmName('vm-b');

    const createHaltedVm = async (vmName: string, namespace: string) => {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '256Mi',
      });
      const payload = yamlLoad(yaml) as KubernetesResource;
      await apiClient.createVirtualMachine(namespace, payload);
      await apiClient.waitForVmExists(vmName, namespace);
      apiClient.trackResource('VirtualMachine', vmName, namespace);
    };

    await createHaltedVm(vmA, projectA);
    await createHaltedVm(vmB, projectB);
  });

  test.afterAll(async ({ apiClient }) => {
    const vms: Array<[string, string]> = [
      [vmA, projectA],
      [vmB, projectB],
    ];
    for (const [vmName, namespace] of vms) {
      if (vmName && namespace) {
        await apiClient.deleteVirtualMachine(namespace, vmName).catch(() => undefined);
        await apiClient.waitForVmDeleted(vmName, namespace).catch(() => undefined);
      }
    }
  });

  test.beforeEach(async ({ vmListPage }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmListPage.clickVmListTab();
  });

  test('clicking a project node applies a Project filter', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Click Local cluster, then click project A in the tree', async () => {
      await vmListPage.clickLocalClusterInTree();
      await vmListPage.clickProjectNode(projectA);
    });

    await test.step('URL contains project parameter for project A', async () => {
      await expect
        .poll(() => projectParams(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toContain(projectA);
    });

    await test.step('Project filter chip appears with project A', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasProjectChip = chips.some((chip) => chip.includes(projectA));
      expect
        .soft(hasProjectChip, `Project chip "${projectA}" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Only the VM in project A is listed', async () => {
      const vmAVisible = await vmListPage.isVmVisibleByDataTest(vmA);
      const vmBHidden = await vmListPage.isVmNameHidden(vmB, TestTimeouts.SHORT_WAIT);

      expect.soft(vmAVisible, `VM ${vmA} should be visible`).toBe(true);
      expect.soft(vmBHidden, `VM ${vmB} should be hidden`).toBe(true);
    });
  });

  test('Project filter toggle stays enabled after a tree selection', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Click Local cluster, then click project A in the tree', async () => {
      await vmListPage.clickLocalClusterInTree();
      await vmListPage.clickProjectNode(projectA);
      await expect
        .poll(() => projectParams(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toContain(projectA);
    });

    await test.step('Project toolbar toggle remains enabled', async () => {
      const enabled = await vmListPage.isProjectFilterEnabled();
      expect
        .soft(enabled, 'Project filter toggle should stay enabled after a tree selection')
        .toBe(true);
    });
  });

  test('clicking Local cluster clears the Project filter', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Click Local cluster, then click project A in the tree', async () => {
      await vmListPage.clickLocalClusterInTree();
      await vmListPage.clickProjectNode(projectA);
      await expect
        .poll(() => projectParams(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toContain(projectA);
    });

    await test.step('Click Local cluster', async () => {
      await vmListPage.clickLocalClusterInTree();
    });

    await test.step('URL no longer contains project parameter', async () => {
      await expect
        .poll(() => projectParams(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toEqual([]);
      expect
        .soft(
          isAllNamespacesPath(vmListPage.page.url()),
          `URL should be all-namespaces (got: ${vmListPage.page.url()})`,
        )
        .toBe(true);
    });

    await test.step('VMs from both projects are visible', async () => {
      const vmAVisible = await vmListPage.isVmVisibleByDataTest(vmA);
      const vmBVisible = await vmListPage.isVmVisibleByDataTest(vmB);

      expect
        .soft(vmAVisible, `VM ${vmA} should be visible after clearing the project filter`)
        .toBe(true);
      expect
        .soft(vmBVisible, `VM ${vmB} should be visible after clearing the project filter`)
        .toBe(true);
    });
  });

  test('adding a second Project filter from a namespaced URL navigates to all-namespaces', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Open the namespaced VirtualMachines list for project A', async () => {
      await vmListPage.clickLocalClusterInTree();
      await vmListPage.clickProjectNode(projectA);
      await expect
        .poll(() => new URL(vmListPage.page.url()).pathname, {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toContain(`/ns/${projectA}/`);
      await expect
        .poll(() => projectParams(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toContain(projectA);
    });

    await test.step('Open the Project filter and select project B', async () => {
      const enabled = await vmListPage.isProjectFilterEnabled();
      expect.soft(enabled, 'Project filter should be enabled on a namespaced list').toBe(true);
      await vmListPage.openProjectFilter();
      await vmListPage.selectProjectInFilterMenu(projectB);
    });

    await test.step('URL path is all-namespaces and both project filters are set', async () => {
      await expect
        .poll(() => isAllNamespacesPath(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);
      await expect
        .poll(() => projectParams(vmListPage.page.url()), {
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toEqual(expect.arrayContaining([projectA, projectB]));
    });

    await test.step('VMs from both projects are listed', async () => {
      const vmAVisible = await vmListPage.isVmVisibleByDataTest(vmA);
      const vmBVisible = await vmListPage.isVmVisibleByDataTest(vmB);

      expect.soft(vmAVisible, `VM ${vmA} should be visible with both project filters`).toBe(true);
      expect.soft(vmBVisible, `VM ${vmB} should be visible with both project filters`).toBe(true);
    });
  });
});
