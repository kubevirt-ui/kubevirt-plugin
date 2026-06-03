import { expect, Page } from '@playwright/test';

import {
  ACTIONS_DROPDOWN,
  ITEM_CREATE,
  NAV_TIMEOUT,
  SAVE_CHANGES,
  SECOND,
  SHORT_TIMEOUT,
} from '../utils/constants';
import { env } from '../utils/env';
import { byTest, byTestId } from '../utils/locators';
import { urls } from '../utils/urls';

const BREADCRUMB_LINK_0 = 'breadcrumb-link-0';
const DROPDOWN_TEXT_FILTER = 'dropdown-text-filter';
const ITEM_FILTER = 'item-filter';
const NAME_FILTER_INPUT = 'name-filter-input';

const SET_AS_DEFAULT_ACTION_SELECTOR = '[data-test-action="Set as default"]';

const NO_STORAGE_CHECKUPS_TEXT = 'No storage checkups found';

/**
 * Generic resource list page — covers any k8s resource list that uses the
 * standard OpenShift Console patterns (item-create, name-filter-input,
 * save-changes, breadcrumb-link-0).
 *
 * Use `navigate(url)` or one of the named navigate helpers in subclasses.
 */
export class ResourceListPage {
  constructor(protected readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Navigate back via the first breadcrumb link. */
  async backToBreadcrumb() {
    await byTestId(this.page, BREADCRUMB_LINK_0).click();
  }

  // ── List interactions ────────────────────────────────────────────────────────

  /** Click the "Clear all filters" button rendered by the PatternFly Toolbar. */
  async clearAllFilters() {
    await this.page.getByRole('button', { name: /clear all filters/i }).click();
  }

  /** Click the primary Create button. */
  async clickCreate() {
    await byTest(this.page, ITEM_CREATE).click();
  }

  /**
   * Click Create and land on the YAML editor.
   *
   * Some resources (e.g. BootableVolumes) render a MenuToggle that opens a
   * dropdown with "With YAML" / "With form" options. Others (e.g. Templates,
   * MigrationPolicies) use a plain button that navigates directly to the YAML
   * editor. This method handles both cases.
   */
  async createFromYAML() {
    await this.waitForListLoaded();
    await this.clickCreate();
    const withYAML = this.page.getByRole('menuitem', { name: 'With YAML' });
    if (await withYAML.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await withYAML.click();
    }
    await expect(this.page.getByText('name: example')).toBeVisible({ timeout: NAV_TIMEOUT });
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  /** Assert a toolbar filter chip with the given label text is visible. */
  async expectChipVisible(label: string) {
    await expect(
      this.page.locator('.pf-v6-c-label__content').filter({ hasText: label }),
    ).toBeVisible();
  }

  async expectEmptyState(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectItemNotVisible(testId: string) {
    await expect(byTestId(this.page, testId)).toHaveCount(0);
  }

  async expectItemVisible(testId: string, timeout = NAV_TIMEOUT) {
    await expect(byTestId(this.page, testId).first()).toBeVisible({ timeout });
  }

  /** Assert the name search input contains the expected value. */
  async expectNameInputValue(value: string) {
    await expect(this.page.locator(`[data-test="${NAME_FILTER_INPUT}"]`)).toHaveValue(value);
  }

  /** Assert no table row containing the given text is visible. */
  async expectRowNotVisible(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
  }

  // ── Filter toolbar interactions ─────────────────────────────────────────────

  /** Assert at least one table row containing the given text is visible. */
  async expectRowVisible(name: string, timeout = NAV_TIMEOUT) {
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({
      timeout,
    });
  }

  /** Assert the current URL contains a specific search param value (waits for async URL update). */
  async expectUrlContainsParam(key: string, value: string) {
    await expect
      .poll(() => new URL(this.page.url()).searchParams.getAll(key), {
        message: `Expected URL param "${key}" to contain "${value}"`,
        timeout: SHORT_TIMEOUT,
      })
      .toContain(value);
  }

  /** Assert the current URL has no search params (waits for async URL update). */
  async expectUrlHasNoFilterParams() {
    await expect
      .poll(() => new URL(this.page.url()).search, {
        message: 'Expected URL to have no search params',
        timeout: SHORT_TIMEOUT,
      })
      .toBe('');
  }

  /** Fill the name filter input.
   * Plugin pages render data-test-id="item-filter"; the standard console SDK
   * renders data-test="name-filter-input". The combined selector handles both.
   */
  async filterByName(name: string, inputIndex = 0) {
    const input = this.page
      .locator(`[data-test="${NAME_FILTER_INPUT}"], [data-test-id="${ITEM_FILTER}"]`)
      .nth(inputIndex);
    await input.waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
    await input.fill(name);
  }

  /**
   * Open the grouped filter dropdown and select a row filter option.
   * Uses `data-test-id="filter-dropdown-toggle"` and `data-test-row-filter`.
   */
  async filterByRowFilter(rowFilterKey: string) {
    const toggle = byTestId(this.page, 'filter-dropdown-toggle');
    await toggle.waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
    await toggle.click();
    await this.page.locator(`[data-test-row-filter="${rowFilterKey}"]`).click();
    await toggle.click();
  }

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    // Wait for either the filter input or the create button to confirm React rendered
    await Promise.any([
      this.page
        .locator(`[data-test="${NAME_FILTER_INPUT}"]`)
        .first()
        .waitFor({ state: 'visible', timeout: NAV_TIMEOUT }),
      this.page
        .locator(`[data-test="${ITEM_CREATE}"]`)
        .first()
        .waitFor({ state: 'visible', timeout: NAV_TIMEOUT }),
      this.page.getByRole('table').waitFor({ state: 'visible', timeout: NAV_TIMEOUT }),
    ]).catch((err: unknown) => {
      // All three waits timed out — surface the error so tests fail fast
      // rather than continuing and producing a cryptic failure at a later assertion.
      throw new Error(
        `navigate(${url}): page did not render a filter input, create button, or table within 30s. ` +
          String(err),
      );
    });
  }

  /**
   * Open the kebab / actions menu for a row identified by visible text.
   */
  async openRowMenu(rowText: string) {
    const row = this.row(rowText);
    await row
      .locator(`[data-test="${ACTIONS_DROPDOWN}"]`)
      .getByRole('button')
      .or(row.getByRole('button', { name: 'Actions' }))
      .first()
      .click();
  }

  /** Click a tab by its visible name. */
  async openTab(name: string) {
    await this.page.getByRole('tab', { name }).click();
  }

  /** Locate a table row by visible text content. */
  row(rowText: string) {
    return this.page.getByRole('row').filter({ hasText: rowText });
  }

  /** Save the YAML editor form. */
  async save() {
    await byTest(this.page, SAVE_CHANGES).click();
  }

  /**
   * Switch the active project/namespace using the OpenShift Console namespace-bar
   * dropdown. Clicks the toggle, types the project name to filter, then selects it.
   */
  async switchProject(ns: string) {
    await this.page.locator('.co-namespace-dropdown__menu-toggle').click();
    const searchInput = byTest(this.page, DROPDOWN_TEXT_FILTER);
    await searchInput.waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
    await searchInput.fill(ns);
    await this.page.getByRole('menuitem', { exact: true, name: ns }).click();
  }

  /** Wait for the first data row (index 1 skips the header) to be visible. */
  protected async waitForFirstDataRow() {
    await this.page
      .getByRole('row')
      .nth(1)
      .waitFor({ state: 'visible', timeout: NAV_TIMEOUT })
      .catch(() => {});
  }

  /**
   * Wait until the list page finishes loading — either data rows appear
   * or the empty state renders. This prevents clicking a Create button
   * that is about to remount in a different location.
   */
  async waitForListLoaded() {
    const dataRow = this.page.getByRole('row').nth(1);
    const emptyState = this.page.locator('.pf-v6-c-empty-state');

    await Promise.any([
      dataRow.waitFor({ state: 'visible', timeout: NAV_TIMEOUT }),
      emptyState.waitFor({ state: 'visible', timeout: NAV_TIMEOUT }),
    ]);
  }
}

// ── Concrete resource list pages ────────────────────────────────────────────

export class InstanceTypesPage extends ResourceListPage {
  async clickUserTab() {
    await this.page.getByText('User InstanceTypes', { exact: true }).click();
  }

  async navigate() {
    await super.navigate(urls.instanceTypes());
  }
}

export class BootableVolumesPage extends ResourceListPage {
  async navigate(ns?: string) {
    await super.navigate(urls.bootableVolumes(ns ?? env.osImagesNamespace));
  }

  async navigateWithParams(params: Record<string, string>, ns?: string) {
    const baseUrl = urls.bootableVolumes(ns ?? env.osImagesNamespace);
    const searchParams = new URLSearchParams(params).toString();
    await super.navigate(`${baseUrl}?${searchParams}`);
  }
}

export class MigrationPoliciesPage extends ResourceListPage {
  async navigate() {
    await super.navigate(urls.migrationPolicies());
  }
}

export class CheckupsPage extends ResourceListPage {
  async expectNoStorageCheckups() {
    await expect(this.page.getByText(NO_STORAGE_CHECKUPS_TEXT)).toBeVisible();
  }

  async navigate() {
    await this.page.goto(urls.checkups(env.cnvNamespace), { waitUntil: 'domcontentloaded' });
    // Wait for the heading which is always rendered (even in empty state)
    await this.page.getByRole('heading', { name: 'Checkups' }).waitFor({ timeout: NAV_TIMEOUT });
  }

  async openStorageTab() {
    await this.openTab('Storage');
  }
}

export class StorageClassesPage extends ResourceListPage {
  async clickAction(action: string) {
    await this.page
      .locator(`[data-test-action="${action}"]`)
      .waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    await this.page.locator(`[data-test-action="${action}"]`).click();
  }

  async expectDefaultLabel(scName: string) {
    await expect(this.row(scName).getByText('Default')).toBeVisible();
  }

  async navigate() {
    await super.navigate(urls.storageClasses());
    await this.waitForFirstDataRow();
  }

  /**
   * Open the row menu for `scName` and click "Set as default".
   * Retries when a mid-flight page reload closes the menu before the action
   * item can be clicked. Waits for the reload triggered by the SC update to
   * settle before returning.
   */
  async setAsDefault(scName: string, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      await this.waitForFirstDataRow();
      await this.openRowMenu(scName);

      const action = this.page.locator(SET_AS_DEFAULT_ACTION_SELECTOR);
      const visible = await action.waitFor({ state: 'visible', timeout: 5 * SECOND }).then(
        () => true,
        () => false,
      );

      if (!visible) {
        // Menu was closed by a reload — dismiss any stale overlay and retry
        await this.page.keyboard.press('Escape');
        continue;
      }

      await Promise.all([this.page.waitForLoadState('domcontentloaded'), action.click()]);

      await this.waitForFirstDataRow();
      return;
    }

    throw new Error(
      `setAsDefault: could not click "Set as default" for "${scName}" after ${retries} attempts`,
    );
  }
}
