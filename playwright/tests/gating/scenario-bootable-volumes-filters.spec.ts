import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';

test.describe('Bootable volumes filtering (gating)', { tag: [GATING_TAG] }, () => {
  test.beforeEach(async ({ bootableVolumesPage, timeouts }) => {
    await bootableVolumesPage.navigateToBootableVolumesViaUI();
    await bootableVolumesPage.waitForTableData();
    await expect
      .poll(() => bootableVolumesPage.getVisibleRowCount(), {
        message: 'Table should have multiple rows before testing filters',
        timeout: timeouts.DEFAULT,
      })
      .toBeGreaterThan(1);
  });

  test('Row filter by OS type narrows results', async ({ bootableVolumesPage, timeouts }) => {
    await bootableVolumesPage.applyRowFilter('centos');

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/centos/i), {
        message: 'centos rows should be visible after OS filter',
        timeout: timeouts.DEFAULT,
      })
      .toBeGreaterThan(0);

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/fedora/i), {
        message: 'fedora rows should be hidden after centos OS filter',
        timeout: timeouts.DEFAULT,
      })
      .toBe(0);
  });

  test('Clearing row filter restores full list', async ({ bootableVolumesPage, timeouts }) => {
    const initialCount = await bootableVolumesPage.getVisibleRowCount();

    await bootableVolumesPage.openRowFilterDropdown();
    await bootableVolumesPage.selectRowFilter('centos');
    await bootableVolumesPage.closeRowFilterDropdown();

    await expect
      .poll(() => bootableVolumesPage.getVisibleRowCount(), {
        message: 'Filtered count should be less than initial',
        timeout: timeouts.DEFAULT,
      })
      .toBeLessThan(initialCount);

    await bootableVolumesPage.clearAllFilters();

    await expect
      .poll(() => bootableVolumesPage.getVisibleRowCount(), {
        message: 'Row count should be restored after clearing filters',
        timeout: timeouts.NAVIGATION,
      })
      .toBe(initialCount);
  });

  test('Name filter is reflected in URL', async ({
    bootableVolumesPage,
    pageCommons,
    timeouts,
  }) => {
    await pageCommons.pageContent.filterByName('centos');

    await expect
      .poll(() => new URL(pageCommons.getCurrentUrl()).searchParams.getAll('name'), {
        message: 'URL should contain name=centos param',
        timeout: timeouts.DEFAULT,
      })
      .toContain('centos');

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/centos/i), {
        message: 'centos rows should be visible after name filter',
        timeout: timeouts.DEFAULT,
      })
      .toBeGreaterThan(0);
  });

  test('Name filter persists across page reload', async ({
    bootableVolumesPage,
    pageCommons,
    timeouts,
  }) => {
    await pageCommons.pageContent.filterByName('centos');
    await bootableVolumesPage.reloadAndWaitForTable(timeouts.NAVIGATION);

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/centos/i), {
        message: 'centos rows should be visible after reload',
        timeout: timeouts.DEFAULT,
      })
      .toBeGreaterThan(0);

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/fedora/i), {
        message: 'fedora hidden after reload with centos filter',
        timeout: timeouts.DEFAULT,
      })
      .toBe(0);
  });

  test('Clearing name filter removes URL search params', async ({ pageCommons, timeouts }) => {
    await pageCommons.pageContent.filterByName('centos');
    await pageCommons.pageContent.filterByName('');

    await expect
      .poll(() => new URL(pageCommons.getCurrentUrl()).search, {
        message: 'URL should have no search params',
        timeout: timeouts.DEFAULT,
      })
      .toBe('');
  });

  test('Direct navigation with filter params pre-fills toolbar', async ({
    bootableVolumesPage,
    timeouts,
  }) => {
    await bootableVolumesPage.navigateToBootableVolumesWithParams('name=centos');

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/centos/i), {
        message: 'centos rows should be visible via URL param',
        timeout: timeouts.DEFAULT,
      })
      .toBeGreaterThan(0);

    await expect
      .poll(() => bootableVolumesPage.getRowCountByText(/fedora/i), {
        message: 'fedora hidden via URL param',
        timeout: timeouts.DEFAULT,
      })
      .toBe(0);
  });
});
