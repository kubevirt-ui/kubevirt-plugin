/**
 * Diagnostics tab — overview cards, severity filtering, search, and sub-tab navigation.
 */
import { expect, test } from '../../fixtures';
import { VMDetailsPage } from '../../pages/VMDetailsPage';
import { VMListPage } from '../../pages/VMListPage';
import { MINUTE, SECOND } from '../../utils/constants';
import { env } from '../../utils/env';
import { createExampleVM, deleteResource } from '../../utils/oc';

const NS = env.testNamespace;
const VM_NAME = `${NS}-diag`;

/** Navigate to the VM's Diagnostics tab. */
async function openDiagnosticsTab(vmList: VMListPage, vmDetails: VMDetailsPage) {
  await vmList.navigateToVMList(NS);
  expect(await vmList.waitForRow(VM_NAME, MINUTE), `VM "${VM_NAME}" not found`).toBe(true);
  await vmList.openVM(VM_NAME);
  await vmDetails.goToTab('Diagnostics');
}

test.describe.configure({ mode: 'serial' });

test.describe('Diagnostics tab', () => {
  test.beforeAll(() => {
    if (!NS) return;
    createExampleVM(VM_NAME, NS);
  });

  test.afterAll(() => {
    if (!NS) return;
    deleteResource('vm', VM_NAME, NS);
  });

  // ── Overview cards ─────────────────────────────────────────────────────────

  test('diagnostics overview is visible with all four severity cards', async ({
    vmDetails,
    vmList,
  }) => {
    await openDiagnosticsTab(vmList, vmDetails);
    await vmDetails.expectDiagnosticsOverviewVisible();
  });

  test('"All statuses" card count matches sum of other cards', async ({ vmDetails, vmList }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    const getCount = async (severity: 'all' | 'critical' | 'healthy' | 'warning') => {
      const text = await vmDetails.diagnosticsCard(severity).innerText();
      return parseInt(text.match(/\d+/)?.[0] ?? '0', 10);
    };

    const critical = await getCount('critical');
    const warning = await getCount('warning');
    const healthy = await getCount('healthy');
    const all = await getCount('all');

    expect(critical + warning + healthy).toBe(all);
  });

  // ── Issues toolbar ─────────────────────────────────────────────────────────

  test('Issues section with toolbar is visible', async ({ vmDetails, vmList }) => {
    await openDiagnosticsTab(vmList, vmDetails);
    await expect(vmDetails.issuesHeading).toBeVisible();
    await expect(vmDetails.diagnosticsSearchInput).toBeVisible();
  });

  // ── Severity card interaction ──────────────────────────────────────────────

  test('clicking a severity card filters and shows selected state', async ({
    vmDetails,
    vmList,
  }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    await vmDetails.clickDiagnosticsCard('healthy');
    await vmDetails.expectDiagnosticsCardSelected('healthy');
    await vmDetails.expectDiagnosticsCardNotSelected('critical');
    await vmDetails.expectDiagnosticsCardNotSelected('warning');
  });

  test('clicking the same severity card again deselects it (toggle-off)', async ({
    vmDetails,
    vmList,
  }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    await vmDetails.clickDiagnosticsCard('healthy');
    await vmDetails.expectDiagnosticsCardSelected('healthy');

    await vmDetails.clickDiagnosticsCard('healthy');
    await vmDetails.expectDiagnosticsCardNotSelected('healthy');
  });

  // ── Search & filter ────────────────────────────────────────────────────────

  test('search with no results shows empty filter state', async ({ vmDetails, vmList }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    await vmDetails.searchDiagnostics('zzz_no_match_zzz');
    await vmDetails.expectDiagnosticsEmptyFilterState();
  });

  test('clearing search restores results', async ({ vmDetails, vmList }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    await vmDetails.searchDiagnostics('zzz_no_match_zzz');
    await vmDetails.expectDiagnosticsEmptyFilterState();

    await vmDetails.clearDiagnosticsSearch();
    await expect(vmDetails.statusConditionsHeading).toBeVisible();
  });

  test('clicking "Clear all filters" from empty state restores results', async ({
    vmDetails,
    vmList,
  }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    await vmDetails.searchDiagnostics('zzz_no_match_zzz');
    await vmDetails.expectDiagnosticsEmptyFilterState();

    await vmDetails.clearAllFiltersButton.click();
    await expect(vmDetails.statusConditionsHeading).toBeVisible();
  });

  test('whitespace-only search is treated as empty', async ({ vmDetails, vmList }) => {
    await openDiagnosticsTab(vmList, vmDetails);

    await vmDetails.searchDiagnostics('   ');
    await expect(vmDetails.statusConditionsHeading).toBeVisible({ timeout: 5 * SECOND });
  });

  // ── Sub-tab navigation ─────────────────────────────────────────────────────

  test('guest system log sub-tab is accessible', async ({ vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    expect(await vmList.waitForRow(VM_NAME, MINUTE), `VM "${VM_NAME}" not found`).toBe(true);
    await vmList.openVM(VM_NAME);

    await vmDetails.goToDiagnosticsSubTab('guest-system-log');
  });

  test('switching back to status conditions sub-tab shows overview', async ({
    vmDetails,
    vmList,
  }) => {
    await vmList.navigateToVMList(NS);
    expect(await vmList.waitForRow(VM_NAME, MINUTE), `VM "${VM_NAME}" not found`).toBe(true);
    await vmList.openVM(VM_NAME);

    await vmDetails.goToDiagnosticsSubTab('guest-system-log');
    await vmDetails.goToDiagnosticsSubTab('status-conditions');
    await vmDetails.expectDiagnosticsOverviewVisible();
  });

  // ── Table structure ────────────────────────────────────────────────────────

  test('status conditions table has expected columns', async ({ page, vmDetails, vmList }) => {
    await openDiagnosticsTab(vmList, vmDetails);
    await expect(vmDetails.statusConditionsHeading).toBeVisible();

    const conditionsTable = page.locator('table', { has: page.getByText('Condition type') });
    await expect(conditionsTable.getByText('Condition type')).toBeVisible();
    await expect(conditionsTable.getByText('Condition', { exact: true })).toBeVisible();
    await expect(conditionsTable.getByText('Reason')).toBeVisible();
  });
});
