import { expect, Page } from '@playwright/test';

import { ITEM_CREATE, KEBAB_BUTTON, SAVE_CHANGES, SECOND } from '../utils/constants';
import { byTest, byTestId } from '../utils/locators';

const BREADCRUMB_LINK_0 = 'breadcrumb-link-0';
const DROPDOWN_TEXT_FILTER = 'dropdown-text-filter';
const ITEM_FILTER = 'item-filter';
const NAME_FILTER_INPUT = 'name-filter-input';

const SET_AS_DEFAULT_ACTION_SELECTOR = '[data-test-action="Set as default"]';

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
    await this.clickCreate();
    const withYAML = this.page.getByRole('menuitem', { name: 'With YAML' });
    if (await withYAML.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await withYAML.click();
    }
    await expect(this.page.getByText('name: example')).toBeVisible({ timeout: 30 * SECOND });
  }

  async expectEmptyState(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectItemNotVisible(testId: string) {
    await expect(byTestId(this.page, testId)).toHaveCount(0);
  }

  async expectItemVisible(testId: string, timeout = 30 * SECOND) {
    await expect(byTestId(this.page, testId).first()).toBeVisible({ timeout });
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  /** Fill the name filter input.
   * Plugin pages render data-test-id="item-filter"; the standard console SDK
   * renders data-test="name-filter-input". The combined selector handles both.
   */
  async filterByName(name: string, inputIndex = 0) {
    const input = this.page
      .locator(`[data-test="${NAME_FILTER_INPUT}"], [data-test-id="${ITEM_FILTER}"]`)
      .nth(inputIndex);
    await input.waitFor({ state: 'visible', timeout: 10 * SECOND });
    await input.fill(name);
  }

  async navigate(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for either the filter input or the create button to confirm React rendered
    await Promise.any([
      this.page
        .locator(`[data-test="${NAME_FILTER_INPUT}"]`)
        .first()
        .waitFor({ state: 'visible', timeout: 30 * SECOND }),
      this.page
        .locator(`[data-test="${ITEM_CREATE}"]`)
        .first()
        .waitFor({ state: 'visible', timeout: 30 * SECOND }),
      this.page.getByRole('table').waitFor({ state: 'visible', timeout: 30 * SECOND }),
    ]).catch(() => {
      // Page may not have these elements (e.g. empty state); proceed and let the test assert
    });
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
    await searchInput.waitFor({ state: 'visible', timeout: 10 * SECOND });
    await searchInput.fill(ns);
    await this.page.getByRole('menuitem', { exact: true, name: ns }).click();
  }
}

// ── Concrete resource list pages ────────────────────────────────────────────

export class InstanceTypesPage extends ResourceListPage {
  async clickUserTab() {
    await this.page.getByText('User InstanceTypes', { exact: true }).click();
  }

  async navigate() {
    await super.navigate(
      '/k8s/cluster/instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype',
    );
  }
}

export class BootableVolumesPage extends ResourceListPage {
  async navigate(ns?: string) {
    const { env } = await import('../utils/env');
    const namespace = ns ?? env.osImagesNamespace;
    await super.navigate(`/k8s/ns/${namespace}/bootablevolumes`);
  }
}

export class MigrationPoliciesPage extends ResourceListPage {
  async navigate() {
    await super.navigate('/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy');
  }
}

export class CheckupsPage extends ResourceListPage {
  async expectNoStorageCheckups() {
    await expect(this.page.getByText('No storage checkups found')).toBeVisible();
  }

  async navigate() {
    const { env } = await import('../utils/env');
    // URL is /checkups (not /virtualization-checkups); the router redirects to /checkups/storage
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/checkups`);
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for the heading which is always rendered (even in empty state)
    await this.page.getByRole('heading', { name: 'Checkups' }).waitFor({ timeout: 30 * SECOND });
  }

  async openStorageTab() {
    await this.page.getByRole('tab', { name: 'Storage' }).click();
  }
}

export class StorageClassesPage extends ResourceListPage {
  async clickAction(action: string) {
    await this.page
      .locator(`[data-test-action="${action}"]`)
      .waitFor({ state: 'visible', timeout: 30 * SECOND });
    await this.page.locator(`[data-test-action="${action}"]`).click();
  }

  async expectDefaultLabel(scName: string) {
    await expect(this.row(scName).getByText('Default')).toBeVisible();
  }

  async navigate() {
    await super.navigate('/k8s/cluster/storage.k8s.io~v1~StorageClass');
    // Wait for the first data row (nth(1) skips the header row)
    await this.page
      .getByRole('row')
      .nth(1)
      .waitFor({ state: 'visible', timeout: 30 * SECOND })
      .catch(() => {});
  }

  async openRowMenu(scName: string) {
    // Console built-in SC list may use data-test-id or data-test depending on version
    await this.row(scName)
      .locator(`[data-test="${KEBAB_BUTTON}"], [data-test-id="${KEBAB_BUTTON}"]`)
      .click();
  }

  row(scName: string) {
    return this.page.getByRole('row').filter({ hasText: scName });
  }

  /**
   * Open the row menu for `scName` and click "Set as default".
   * If the action item is already disabled (SC is already the default), closes the
   * menu silently and proceeds — `expectDefaultLabel` will confirm the state.
   */
  async setAsDefault(scName: string) {
    await this.openRowMenu(scName);
    await this.page.locator(SET_AS_DEFAULT_ACTION_SELECTOR).click({ timeout: 30 * SECOND });
  }
}
