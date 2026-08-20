import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_SEARCH_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-search-fixture';
import {
  cleanupVmFixtures,
  createHaltedVm,
  waitForVmPrintableStatus,
} from '@/utils/vm-search-test-helpers';

const SUITE = 'VM Search Language';

const DESC_DATABASE = 'database-search-lang';
const DESC_WEB = 'web-search-lang';
const DESC_CACHE = 'cache-search-lang';

test.describe(SUITE, { tag: [T1_TAG, VM_SEARCH_TAG] }, () => {
  let vmFedora: string;
  let vmRhelGpu: string;
  let vmFedoraHighCpu: string;
  let testNamespace: string;

  test.beforeAll(async ({ apiClient, testConfig, utils }) => {
    testNamespace = testConfig.testNamespace;

    vmFedora = utils.generateRandomVmName('sl-fed');
    vmRhelGpu = utils.generateRandomVmName('sl-rhel');
    vmFedoraHighCpu = utils.generateRandomVmName('sl-cpu');

    await createHaltedVm(apiClient, {
      cpuCores: 1,
      description: DESC_DATABASE,
      memory: '256Mi',
      name: vmFedora,
      namespace: testNamespace,
      os: 'fedora',
    });
    await createHaltedVm(apiClient, {
      cpuCores: 8,
      description: DESC_WEB,
      memory: '8Gi',
      name: vmRhelGpu,
      namespace: testNamespace,
      os: 'rhel',
      gpus: [{ deviceName: 'nvidia.com/gpu', name: 'gpu1' }],
    });
    await createHaltedVm(apiClient, {
      cpuCores: 8,
      description: DESC_CACHE,
      memory: '256Mi',
      name: vmFedoraHighCpu,
      namespace: testNamespace,
      os: 'fedora',
    });

    await Promise.all(
      [vmFedora, vmRhelGpu, vmFedoraHighCpu].map((vmName) =>
        waitForVmPrintableStatus(apiClient, testNamespace, vmName, 'Stopped'),
      ),
    );
  });

  test.afterAll(async ({ apiClient }) => {
    await cleanupVmFixtures(apiClient, testNamespace, [vmFedora, vmRhelGpu, vmFedoraHighCpu]);
  });

  test.beforeEach(async ({ vmListPage, testConfig }) => {
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.clickVmListTab();
    await vmListPage.waitForVmRowVisible(vmFedora);
  });

  test.afterEach(async ({ vmListPage }) => {
    await vmListPage.clickClearSearchButton();
  });

  test('plain text search filters VMs by name', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Type plain text and submit search', async () => {
      await vmListPage.appendToVmSearch(vmFedora);
    });

    await test.step('Name filter chip is applied', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasNameChip = chips.some((chip) => chip.includes(vmFedora));
      expect
        .soft(
          hasNameChip,
          `Name filter chip should contain "${vmFedora}" (got: ${chips.join(', ')})`,
        )
        .toBe(true);
    });

    await test.step('Only the matching VM is listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedoraHighCpu)).toBe(true);
    });

    await test.step('Clear search resets filters', async () => {
      await vmListPage.clickClearSearchButton();
      const isEmpty = await vmListPage.verifyVmSearchInputEmpty();
      expect.soft(isEmpty, 'Search input should be empty after clearing').toBe(true);
    });
  });

  test('key:value search filters by status', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit status:Running search', async () => {
      await vmListPage.appendToVmSearch('status:Running');
    });

    await test.step('Running filter chip appears', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasRunningChip = chips.some((chip) => chip.includes('Running'));
      expect
        .soft(hasRunningChip, `Filter chip "Running" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Stopped dummy VMs are hidden', async () => {
      expect(await vmListPage.isVmNameHidden(vmFedora)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedoraHighCpu)).toBe(true);
    });
  });

  test('comma-separated values apply OR logic within a key', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit status:Running,Stopped search', async () => {
      await vmListPage.appendToVmSearch('status:Running,Stopped');
    });

    await test.step('Both Running and Stopped filter chips appear', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasRunning = chips.some((chip) => chip.includes('Running'));
      const hasStopped = chips.some((chip) => chip.includes('Stopped'));
      expect
        .soft(
          hasRunning,
          `Filter chip "Running" should appear for OR logic (got: ${chips.join(', ')})`,
        )
        .toBe(true);
      expect
        .soft(
          hasStopped,
          `Filter chip "Stopped" should appear for OR logic (got: ${chips.join(', ')})`,
        )
        .toBe(true);
    });

    await test.step('Stopped dummy VMs are listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
    });
  });

  test('space-separated tokens apply AND logic across keys', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit multi-key search with AND logic', async () => {
      await vmListPage.appendToVmSearch('status:Stopped os:Fedora');
    });

    await test.step('Both Status and OS filter chips appear', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasStopped = chips.some((chip) => chip.includes('Stopped'));
      const hasFedora = chips.some((chip) => chip.includes('Fedora'));
      expect
        .soft(hasStopped, `Status chip "Stopped" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
      expect
        .soft(hasFedora, `OS chip "Fedora" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Only Stopped Fedora VMs are listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
    });
  });

  test('numeric filter with > operator for vcpu', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit vcpu>4 search', async () => {
      await vmListPage.appendToVmSearch('vcpu>4');
    });

    await test.step('CPU filter chip is applied', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasCpuChip = chips.some((chip) => chip.includes('>') && chip.includes('4'));
      expect
        .soft(hasCpuChip, `CPU filter chip with "> 4" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Only VMs with more than 4 vCPUs are listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedora)).toBe(true);
    });
  });

  test('numeric filter with >= operator for memory', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit memory>=8GiB search', async () => {
      await vmListPage.appendToVmSearch('memory>=8GiB');
    });

    await test.step('Memory filter chip is applied', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasMemChip = chips.some((chip) => chip.includes('>=') && chip.includes('8'));
      expect
        .soft(
          hasMemChip,
          `Memory filter chip with ">= 8GiB" should appear (got: ${chips.join(', ')})`,
        )
        .toBe(true);
    });

    await test.step('Only VMs with at least 8Gi memory are listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedora)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedoraHighCpu)).toBe(true);
    });
  });

  test('description: key explicitly searches descriptions', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit description:database search', async () => {
      await vmListPage.appendToVmSearch('description:database');
    });

    await test.step('Description filter chip appears', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasDescChip = chips.some((chip) => chip.includes('database'));
      expect
        .soft(
          hasDescChip,
          `Description filter chip "database" should appear (got: ${chips.join(', ')})`,
        )
        .toBe(true);
    });

    await test.step('Only the VM whose description contains database is listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedoraHighCpu)).toBe(true);
    });
  });

  test('exclusion prefix -key:value shows Exclude chip', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit -status:Error search', async () => {
      await vmListPage.appendToVmSearch('-status:Error');
    });

    await test.step('Exclude Error filter chip appears', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasExcludeChip = chips.some(
        (chip) => chip.includes('Exclude') && chip.includes('Error'),
      );
      expect
        .soft(hasExcludeChip, `Chip should show "Exclude Error" (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Stopped dummy VMs remain listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmRhelGpu)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
    });
  });

  test('exclusion with has key: -has:gpu', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit -has:gpu search', async () => {
      await vmListPage.appendToVmSearch('-has:gpu');
    });

    await test.step('Exclude gpu filter chip appears', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasExcludeGpu = chips.some(
        (chip) => chip.toLowerCase().includes('exclude') && chip.toLowerCase().includes('gpu'),
      );
      expect
        .soft(hasExcludeGpu, `Chip should show "Exclude gpu" (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('VM with a GPU is hidden', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
    });
  });

  test('exclusion prefix -name: hides the named VM', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit -name search for the RHEL VM', async () => {
      await vmListPage.appendToVmSearch(`-name:${vmRhelGpu}`);
    });

    await test.step('Exclude name filter chip appears', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasExcludeName = chips.some(
        (chip) => chip.toLowerCase().includes('exclude') && chip.includes(vmRhelGpu),
      );
      expect
        .soft(
          hasExcludeName,
          `Chip should show Exclude for "${vmRhelGpu}" (got: ${chips.join(', ')})`,
        )
        .toBe(true);
    });

    await test.step('Named VM is hidden and the others remain', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedora)).toBe(true);
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
    });
  });

  test('combined search: status:Stopped vcpu>4 -has:gpu', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Submit combined multi-token search', async () => {
      await vmListPage.appendToVmSearch('status:Stopped vcpu>4 -has:gpu');
    });

    await test.step('All three filter chips are applied', async () => {
      const chips = await vmListPage.getFilterChipTexts();
      const hasStopped = chips.some((chip) => chip.includes('Stopped'));
      const hasCpu = chips.some((chip) => chip.includes('>') && chip.includes('4'));
      const hasExcludeGpu = chips.some(
        (chip) => chip.toLowerCase().includes('exclude') && chip.toLowerCase().includes('gpu'),
      );

      expect
        .soft(hasStopped, `Status chip "Stopped" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
      expect
        .soft(hasCpu, `CPU chip with "> 4" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
      expect
        .soft(hasExcludeGpu, `Exclude gpu chip should appear (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Only the Stopped high-CPU VM without a GPU is listed', async () => {
      expect(await vmListPage.isVmVisibleByDataTest(vmFedoraHighCpu)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmFedora)).toBe(true);
      expect(await vmListPage.isVmNameHidden(vmRhelGpu)).toBe(true);
    });
  });

  test('search input clears with clear button', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Enter a search query', async () => {
      await vmListPage.typeInVmSearchInput('status:Running');
      const value = await vmListPage.getSearchInputValue();
      expect.soft(value, 'Search input should contain the typed text').toBe('status:Running');
    });

    await test.step('Clear button empties the input', async () => {
      await vmListPage.clickClearSearchButton();
      const isEmpty = await vmListPage.verifyVmSearchInputEmpty();
      expect.soft(isEmpty, 'Search input should be empty after clicking clear').toBe(true);
    });
  });

  test('search dropdown shows key suggestions on focus', async ({ vmListPage, utils }) => {
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

    await test.step('Search by keys section is visible with expected keys', async () => {
      const keysSectionVisible = await vmListPage.isSearchKeysSectionVisible();
      expect
        .soft(keysSectionVisible, 'Search by keys section should be visible in the dropdown')
        .toBe(true);

      const nameKeyVisible = await vmListPage.isSearchKeyVisible('name');
      expect.soft(nameKeyVisible, '"name" key should appear in the Search by section').toBe(true);

      const statusKeyVisible = await vmListPage.isSearchKeyVisible('status');
      expect
        .soft(statusKeyVisible, '"status" key should appear in the Search by section')
        .toBe(true);
    });

    await vmListPage.pressKeyInVmSearchInput('Escape');
  });

  test('search dropdown shows value suggestions after typing key:', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Type "status:" to trigger value autocomplete', async () => {
      await vmListPage.typeInVmSearchInput('status:');
      const dropdownVisible = await vmListPage.isSearchDropdownVisible();
      expect
        .soft(dropdownVisible, 'Dropdown should appear with value suggestions for "status:"')
        .toBe(true);
    });

    await test.step('Value suggestions include expected status values', async () => {
      const values = await vmListPage.getSearchDropdownValues();
      const hasRunning = values.some((v) => v.includes('Running'));
      const hasStopped = values.some((v) => v.includes('Stopped'));
      expect
        .soft(hasRunning, `Value suggestions should include "Running" (got: ${values.join(', ')})`)
        .toBe(true);
      expect
        .soft(hasStopped, `Value suggestions should include "Stopped" (got: ${values.join(', ')})`)
        .toBe(true);
    });

    await vmListPage.pressKeyInVmSearchInput('Escape');
  });

  test('search examples are shown in dropdown', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_SEARCH_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Focus search input and verify examples appear', async () => {
      await vmListPage.typeInVmSearchInput('');
      const resultsVisible = await vmListPage.isSearchDropdownVisible();
      expect.soft(resultsVisible, 'Search dropdown should show example queries').toBe(true);
    });

    await test.step('Examples section contains query patterns', async () => {
      const exampleText = vmListPage.page.locator('code').first();
      const hasExamples = await exampleText.isVisible().catch(() => false);
      expect
        .soft(hasExamples, 'At least one example query should be visible in the dropdown')
        .toBe(true);
    });

    await vmListPage.pressKeyInVmSearchInput('Escape');
  });
});
