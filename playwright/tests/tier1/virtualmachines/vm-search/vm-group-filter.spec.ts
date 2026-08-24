import { load as yamlLoad } from 'js-yaml';

import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_SEARCH_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/vm-search-fixture';
import { FOLDER_LABEL } from '@/utils/api-builders';
import { TestTimeouts } from '@/utils/test-config';
import { cleanupVmFixtures } from '@/utils/vm-search-test-helpers';

const SUITE = 'VM Group Filter';

const GROUP_ALPHA = 'group-alpha';
const GROUP_BETA = 'group-beta';
const GROUP_GAMMA = 'group-gamma';

test.describe(SUITE, { tag: [T1_TAG, VM_SEARCH_TAG] }, () => {
  let vmAlpha1: string;
  let vmAlpha2: string;
  let vmBeta1: string;
  let vmGamma1: string;
  let testNamespace: string;

  test.beforeAll(async ({ apiClient, testConfig, utils }) => {
    testNamespace = testConfig.testNamespace;

    vmAlpha1 = utils.generateRandomVmName('vm-a1');
    vmAlpha2 = utils.generateRandomVmName('vm-a2');
    vmBeta1 = utils.generateRandomVmName('vm-b1');
    vmGamma1 = utils.generateRandomVmName('vm-g1');

    const createVmWithFolder = async (vmName: string, folderName: string) => {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '256Mi',
      });
      const payload = yamlLoad(yaml) as KubernetesResource;
      payload.metadata = {
        ...(payload.metadata ?? {}),
        labels: {
          ...(payload.metadata?.labels ?? {}),
          [FOLDER_LABEL]: folderName,
        },
      };
      await apiClient.createVirtualMachine(testNamespace, payload);
      await apiClient.waitForVmExists(vmName, testNamespace);
    };

    await createVmWithFolder(vmAlpha1, GROUP_ALPHA);
    await createVmWithFolder(vmAlpha2, GROUP_ALPHA);
    await createVmWithFolder(vmBeta1, GROUP_BETA);
    await createVmWithFolder(vmGamma1, GROUP_GAMMA);
  });

  test.afterAll(async ({ apiClient }) => {
    await cleanupVmFixtures(apiClient, testNamespace, [vmAlpha1, vmAlpha2, vmBeta1, vmGamma1]);
  });

  test.beforeEach(async ({ vmListPage }) => {
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testNamespace);
    await vmListPage.clickVmListTab();
  });

  test.describe('Search language', () => {
    test('group key visible in search suggestions', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Focus search input to open dropdown', async () => {
        await vmListPage.typeInVmSearchInput('');
        const dropdownVisible = await vmListPage.isSearchDropdownVisible();
        expect
          .soft(dropdownVisible, 'Search dropdown should appear when input is focused')
          .toBe(true);
      });

      await test.step('Group key is visible in search suggestions', async () => {
        const groupKeyVisible = await vmListPage.isSearchKeyVisible('group');
        expect
          .soft(groupKeyVisible, '"group" key should appear in the Search by section')
          .toBe(true);
      });

      await vmListPage.pressKeyInVmSearchInput('Escape');
    });

    test('group:folderName filters VMs by group', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Submit group:group-alpha search', async () => {
        await vmListPage.fillVmSearchInput(`group:${GROUP_ALPHA}`);
      });

      await test.step('Group filter chip appears with folder name', async () => {
        const chips = await vmListPage.getFilterChipTexts();
        const hasGroupChip = chips.some((chip) => chip.includes(GROUP_ALPHA));
        expect
          .soft(
            hasGroupChip,
            `Group filter chip "${GROUP_ALPHA}" should appear (got: ${chips.join(', ')})`,
          )
          .toBe(true);
      });

      await test.step('Only VMs in group-alpha are visible', async () => {
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const alpha2Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha2);
        const beta1Visible = await vmListPage.isVmNameHidden(vmBeta1, TestTimeouts.SHORT_WAIT);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible`).toBe(true);
        expect.soft(alpha2Visible, `VM ${vmAlpha2} should be visible`).toBe(true);
        expect.soft(beta1Visible, `VM ${vmBeta1} should be hidden`).toBe(true);
      });

      await vmListPage.clickClearSearchButton();
    });

    test('comma-separated groups apply OR logic', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Submit group:group-alpha,group-beta search', async () => {
        await vmListPage.fillVmSearchInput(`group:${GROUP_ALPHA},${GROUP_BETA}`);
      });

      await test.step('Both group filter chips appear', async () => {
        const chips = await vmListPage.getFilterChipTexts();
        const hasAlpha = chips.some((chip) => chip.includes(GROUP_ALPHA));
        const hasBeta = chips.some((chip) => chip.includes(GROUP_BETA));
        expect
          .soft(hasAlpha, `Chip "${GROUP_ALPHA}" should appear (got: ${chips.join(', ')})`)
          .toBe(true);
        expect
          .soft(hasBeta, `Chip "${GROUP_BETA}" should appear (got: ${chips.join(', ')})`)
          .toBe(true);
      });

      await test.step('Alpha and beta VMs are visible, gamma VM is hidden', async () => {
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const alpha2Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha2);
        const beta1Visible = await vmListPage.isVmVisibleByDataTest(vmBeta1);
        const gamma1Hidden = await vmListPage.isVmNameHidden(vmGamma1, TestTimeouts.SHORT_WAIT);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible`).toBe(true);
        expect.soft(alpha2Visible, `VM ${vmAlpha2} should be visible`).toBe(true);
        expect.soft(beta1Visible, `VM ${vmBeta1} should be visible`).toBe(true);
        expect.soft(gamma1Hidden, `VM ${vmGamma1} should be hidden`).toBe(true);
      });

      await vmListPage.clickClearSearchButton();
    });

    test('clearing group filter restores all VMs', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Apply group filter', async () => {
        await vmListPage.fillVmSearchInput(`group:${GROUP_ALPHA}`);
      });

      await test.step('Clear search', async () => {
        await vmListPage.clickClearSearchButton();
      });

      await test.step('All VMs are visible again', async () => {
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const beta1Visible = await vmListPage.isVmVisibleByDataTest(vmBeta1);
        const gamma1Visible = await vmListPage.isVmVisibleByDataTest(vmGamma1);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible after clear`).toBe(true);
        expect.soft(beta1Visible, `VM ${vmBeta1} should be visible after clear`).toBe(true);
        expect.soft(gamma1Visible, `VM ${vmGamma1} should be visible after clear`).toBe(true);
      });
    });
  });

  test.describe('Advanced Search modal', () => {
    test('selecting group in modal applies filter', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Open Advanced Search modal', async () => {
        await vmListPage.clickAdvancedSearchButton();
      });

      await test.step('Select group-alpha in the Group field', async () => {
        await vmListPage.setAdvancedSearchGroup(GROUP_ALPHA);
      });

      await test.step('Submit the search', async () => {
        await vmListPage.clickFooterSearchButton();
      });

      await test.step('Group filter chip appears', async () => {
        const chips = await vmListPage.getFilterChipTexts();
        const hasGroupChip = chips.some((chip) => chip.includes(GROUP_ALPHA));
        expect
          .soft(
            hasGroupChip,
            `Group chip "${GROUP_ALPHA}" should appear (got: ${chips.join(', ')})`,
          )
          .toBe(true);
      });

      await test.step('Only group-alpha VMs are listed', async () => {
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const alpha2Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha2);
        const beta1Hidden = await vmListPage.isVmNameHidden(vmBeta1, TestTimeouts.SHORT_WAIT);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible`).toBe(true);
        expect.soft(alpha2Visible, `VM ${vmAlpha2} should be visible`).toBe(true);
        expect.soft(beta1Hidden, `VM ${vmBeta1} should be hidden`).toBe(true);
      });

      await vmListPage.clickClearSearchButton();
    });

    test('multi-group selection shows all matching VMs', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Open Advanced Search modal', async () => {
        await vmListPage.clickAdvancedSearchButton();
      });

      await test.step('Select both groups', async () => {
        await vmListPage.setAdvancedSearchGroup(GROUP_ALPHA);
        await vmListPage.setAdvancedSearchGroup(GROUP_BETA);
      });

      await test.step('Submit the search', async () => {
        await vmListPage.clickFooterSearchButton();
      });

      await test.step('Alpha and beta VMs are visible, gamma VM is hidden', async () => {
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const alpha2Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha2);
        const beta1Visible = await vmListPage.isVmVisibleByDataTest(vmBeta1);
        const gamma1Hidden = await vmListPage.isVmNameHidden(vmGamma1, TestTimeouts.SHORT_WAIT);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible`).toBe(true);
        expect.soft(alpha2Visible, `VM ${vmAlpha2} should be visible`).toBe(true);
        expect.soft(beta1Visible, `VM ${vmBeta1} should be visible`).toBe(true);
        expect.soft(gamma1Hidden, `VM ${vmGamma1} should be hidden`).toBe(true);
      });

      await vmListPage.clickClearSearchButton();
    });
  });

  test.describe('Tree view', () => {
    test('clicking folder node applies group filter', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Expand project in tree and click group-alpha folder', async () => {
        await vmListPage.clickTreeNodeAndEnsureExpanded(testNamespace);
        await vmListPage.clickFolderNode(GROUP_ALPHA, testNamespace);
      });

      await test.step('URL contains group parameter', async () => {
        const url = vmListPage.page.url();
        const hasGroupParam = url.includes(`group=${GROUP_ALPHA}`);
        expect
          .soft(hasGroupParam, `URL should contain group=${GROUP_ALPHA} (got: ${url})`)
          .toBe(true);
      });

      await test.step('Only group-alpha VMs are listed', async () => {
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const alpha2Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha2);
        const beta1Hidden = await vmListPage.isVmNameHidden(vmBeta1, TestTimeouts.SHORT_WAIT);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible`).toBe(true);
        expect.soft(alpha2Visible, `VM ${vmAlpha2} should be visible`).toBe(true);
        expect.soft(beta1Hidden, `VM ${vmBeta1} should be hidden`).toBe(true);
      });
    });

    test('clicking project node removes group filter', async ({ vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
      });

      await test.step('Click folder node to apply group filter', async () => {
        await vmListPage.clickTreeNodeAndEnsureExpanded(testNamespace);
        await vmListPage.clickFolderNode(GROUP_ALPHA, testNamespace);
      });

      await test.step('Click project node to remove group filter', async () => {
        await vmListPage.clickProjectNode(testNamespace);
      });

      await test.step('URL no longer contains group parameter', async () => {
        const url = vmListPage.page.url();
        const hasGroupParam = url.includes('group=');
        expect.soft(hasGroupParam, `URL should not contain group= (got: ${url})`).toBe(false);
      });

      await test.step('All VMs are visible again', async () => {
        await vmListPage.clickVmListTab();
        const alpha1Visible = await vmListPage.isVmVisibleByDataTest(vmAlpha1);
        const beta1Visible = await vmListPage.isVmVisibleByDataTest(vmBeta1);
        const gamma1Visible = await vmListPage.isVmVisibleByDataTest(vmGamma1);

        expect.soft(alpha1Visible, `VM ${vmAlpha1} should be visible`).toBe(true);
        expect.soft(beta1Visible, `VM ${vmBeta1} should be visible`).toBe(true);
        expect.soft(gamma1Visible, `VM ${vmGamma1} should be visible`).toBe(true);
      });
    });
  });
});
