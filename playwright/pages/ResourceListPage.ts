import { expect, Page } from '@playwright/test';

import { byTest, byTestId } from '../utils/locators';

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
    await byTestId(this.page, 'breadcrumb-link-0').click();
  }

  // ── List interactions ────────────────────────────────────────────────────────

  /** Click the primary Create button. */
  async clickCreate() {
    await byTest(this.page, 'item-create').first().click();
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
    if (await withYAML.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await withYAML.click();
    }
    await expect(this.page.getByText('name: example')).toBeVisible({ timeout: 30_000 });
  }

  async expectEmptyState(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectItemNotVisible(testId: string) {
    await expect(byTestId(this.page, testId)).toHaveCount(0);
  }

  async expectItemVisible(testId: string, timeout = 30_000) {
    await expect(byTestId(this.page, testId).first()).toBeVisible({ timeout });
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  /** Fill the name filter input.
   * Plugin pages render data-test-id="item-filter"; the standard console SDK
   * renders data-test="name-filter-input". The combined selector handles both.
   */
  async filterByName(name: string, inputIndex = 0) {
    const input = this.page
      .locator('[data-test="name-filter-input"], [data-test-id="item-filter"]')
      .nth(inputIndex);
    await input.waitFor({ state: 'visible', timeout: 10_000 });
    await input.fill(name);
  }

  async navigate(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for either the filter input or the create button to confirm React rendered
    await Promise.any([
      this.page
        .locator('[data-test="name-filter-input"]')
        .first()
        .waitFor({ state: 'visible', timeout: 30_000 }),
      this.page
        .locator('[data-test="item-create"]')
        .first()
        .waitFor({ state: 'visible', timeout: 30_000 }),
      this.page.getByRole('table').waitFor({ state: 'visible', timeout: 30_000 }),
    ]).catch(() => {
      // Page may not have these elements (e.g. empty state); proceed and let the test assert
    });
  }

  /** Save the YAML editor form. */
  async save() {
    await byTest(this.page, 'save-changes').click();
  }

  /**
   * Switch the active project/namespace using the OpenShift Console namespace-bar
   * dropdown. Clicks the toggle, types the project name to filter, then selects it.
   */
  async switchProject(ns: string) {
    await this.page.locator('.co-namespace-dropdown__menu-toggle').click();
    const searchInput = this.page.locator('[data-test="dropdown-text-filter"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10_000 });
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
    await this.page.getByRole('heading', { name: 'Checkups' }).waitFor({ timeout: 30_000 });
  }

  async openStorageTab() {
    await this.page.getByRole('tab', { name: 'Storage' }).click();
  }
}

export class StorageClassesPage extends ResourceListPage {
  async clickAction(action: string) {
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
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => {});
  }

  async openRowMenu(scName: string) {
    // Console built-in SC list may use data-test-id or data-test depending on version
    await this.row(scName)
      .locator('[data-test="kebab-button"], [data-test-id="kebab-button"]')
      .click();
  }

  row(scName: string) {
    return this.page.getByRole('row').filter({ hasText: scName });
  }
}
