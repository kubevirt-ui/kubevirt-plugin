/**
 * Bootable volumes list page — filtering and URL state persistence.
 */
import { expect, test } from '../../fixtures';
import { NAV_TIMEOUT } from '../../utils/constants';

test.describe('Bootable volumes filtering', () => {
  test.beforeEach(async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.navigate();
  });

  // ── Name filter ────────────────────────────────────────────────────────────

  test('filter by name shows matching rows', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByName('centos');
    await bootableVolumesPage.expectRowVisible('centos');
  });

  test('filter by name hides non-matching rows', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByName('centos');
    await bootableVolumesPage.expectRowNotVisible('fedora');
  });

  // ── Row filters (grouped dropdown) ────────────────────────────────────────

  test('filter by OS type', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByRowFilter('centos');
    await bootableVolumesPage.expectRowVisible('centos');
    await bootableVolumesPage.expectRowNotVisible('fedora');
  });

  test('filter by architecture', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByRowFilter('NO_DATA');
    await bootableVolumesPage.expectRowVisible('centos');
  });

  // ── Clear filters ──────────────────────────────────────────────────────────

  test('clear all filters restores full list', async ({ bootableVolumesPage, page }) => {
    await bootableVolumesPage.filterByName('centos');
    await bootableVolumesPage.expectRowNotVisible('fedora');

    await bootableVolumesPage.clearAllFilters();

    await bootableVolumesPage.expectRowVisible('fedora', NAV_TIMEOUT);
    await expect(page.locator('[data-test="name-filter-input"]')).toHaveValue('');
  });

  // ── URL state persistence ──────────────────────────────────────────────────

  test('name filter is reflected in URL search params', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByName('centos');
    await bootableVolumesPage.expectUrlContainsParam('name', 'centos');
  });

  test('row filter is reflected in URL search params', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByRowFilter('centos');
    await bootableVolumesPage.expectUrlContainsParam('osName', 'centos');
  });

  test('page reload preserves filters and shows filtered data', async ({
    bootableVolumesPage,
    page,
  }) => {
    await bootableVolumesPage.filterByName('centos');
    await bootableVolumesPage.expectRowVisible('centos');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('row').first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT });

    await bootableVolumesPage.expectRowVisible('centos');
    await bootableVolumesPage.expectRowNotVisible('fedora');
    await bootableVolumesPage.expectNameInputValue('centos');
  });

  test('direct navigation with filter params pre-fills toolbar', async ({
    bootableVolumesPage,
    page,
  }) => {
    await bootableVolumesPage.navigateWithParams({ name: 'centos' });
    await page.getByRole('row').first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT });

    await bootableVolumesPage.expectRowVisible('centos');
    await bootableVolumesPage.expectRowNotVisible('fedora');
    await bootableVolumesPage.expectNameInputValue('centos');
  });

  test('clearing filters removes URL search params', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.filterByName('centos');
    await bootableVolumesPage.expectUrlContainsParam('name', 'centos');

    await bootableVolumesPage.clearAllFilters();
    await bootableVolumesPage.expectUrlHasNoFilterParams();
  });
});
