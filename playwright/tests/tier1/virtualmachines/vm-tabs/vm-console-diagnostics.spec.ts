import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

test.describe('Tier1 Diagnostics Tab Redesign', { tag: [T1_TAG] }, () => {
  test(
    'Diagnostics overview cards, severity filter, and search',
    { tag: ['@nonpriv'] },
    async ({ apiClient, vmTreePage, vmDetailPage, utils, testConfig }) => {
      await utils.withAllure({
        suite: 'VM Diagnostics redesign',
        feature: T1,
        tags: [T1_TAG, VM_TABS_TAG, 'cnv-87387'],
      });

      const ns = utils.generateTestNamespace('vm-diag-redesign');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('vm-diag');

      await apiClient.createVmFromInstanceType('fedora', vmName, ns, undefined, undefined, true);
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await apiClient.waitForVmRunning(vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
      await vmTreePage.toggleEmptyProjectsDisplay(true);
      await vmTreePage.searchTreeView(ns);
      await vmTreePage.clickTreeNodeAndEnsureExpanded(ns, vmName, ns);
      await vmTreePage.clickVmInTreeView(vmName, ns);
      await vmDetailPage.navigateToDiagnostics();

      await test.step('Diagnostics tab is accessible and may show a badge', async () => {
        const badgeCount = await vmDetailPage.getDiagnosticsTabBadgeCount();
        if (badgeCount !== null) {
          expect
            .soft(badgeCount, 'Badge count should be a non-negative number')
            .toBeGreaterThanOrEqual(0);
        }
      });

      await test.step('Severity overview cards present with consistent counts', async () => {
        const cards = await vmDetailPage.getDiagnosticsOverviewCardCounts();
        expect.soft(cards.critical, 'Critical card count should be >= 0').toBeGreaterThanOrEqual(0);
        expect.soft(cards.warnings, 'Warnings card count should be >= 0').toBeGreaterThanOrEqual(0);
        expect.soft(cards.healthy, 'Healthy card count should be >= 0').toBeGreaterThanOrEqual(0);
        expect
          .soft(
            cards.allStatuses,
            'All statuses count should equal sum of critical + warnings + healthy',
          )
          .toBe(cards.critical + cards.warnings + cards.healthy);
      });

      await test.step('Status conditions table shows rows with severity labels', async () => {
        const rows = await vmDetailPage.getStatusConditionRows();
        expect
          .soft(rows.length, 'Status conditions table should have at least one row')
          .toBeGreaterThan(0);

        const statuses = rows.map((r) => r.status);
        const validStatuses = ['Healthy', 'Degraded', 'Warning', 'Unknown', 'Failed'];
        for (const s of statuses) {
          expect
            .soft(validStatuses, `Condition status "${s}" should be a known severity label`)
            .toContain(s);
        }
      });

      await test.step('Clicking Warnings card filters to warning-only rows', async () => {
        await vmDetailPage.clickSeverityCard('warning');

        const filteredRows = await vmDetailPage.getStatusConditionRows();
        for (const row of filteredRows) {
          expect
            .soft(
              row.status,
              `Filtered row "${row.conditionType}" should be Degraded (warning severity)`,
            )
            .toBe('Degraded');
        }

        await vmDetailPage.clickSeverityCard('warning');
      });

      await test.step('Search filters conditions by text', async () => {
        const allRows = await vmDetailPage.getStatusConditionRows();
        const firstType = allRows[0]?.conditionType ?? 'Ready';

        await vmDetailPage.searchDiagnostics(firstType);

        const searchedRows = await vmDetailPage.getStatusConditionRows();
        expect
          .soft(searchedRows.length, `Search for "${firstType}" should return at least one row`)
          .toBeGreaterThanOrEqual(1);

        for (const row of searchedRows) {
          expect
            .soft(
              row.conditionType.toLowerCase().includes(firstType.toLowerCase()),
              `Search result "${row.conditionType}" should match search term "${firstType}"`,
            )
            .toBe(true);
        }

        await vmDetailPage.clearDiagnosticsSearch();
      });
    },
  );
});
