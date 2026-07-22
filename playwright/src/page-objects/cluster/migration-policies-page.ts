import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class MigrationPoliciesPage extends PageCommons {
  private readonly _dataTestRowsResourceRow = this.locator('[data-test-rows="resource-row"]');

  /** Filter toolbar (Fleet ACM: Cluster filter) – first Cluster menu-toggle in toolbar only. */
  private readonly _filterToolbarClusterButton = this.testId('filter-toolbar')
    .locator('button.pf-v6-c-menu-toggle')
    .filter({ hasText: 'Cluster' })
    .first();

  private readonly _nameInput = this.locator('[role="dialog"] input[type="text"]').first();

  override readonly _createButton = this.testId('item-create');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Clicks the actions dropdown button on the detail page.
   */
  override async clickActionsDropdown() {
    const actionsDropdown = this.testId('actions-dropdown');
    await actionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(actionsDropdown);
  }

  async clickCancelButton() {
    const byTestId = this.testId('modal-cancel-action');
    const formCancelButton = this.page
      .locator('[role="dialog"]')
      .getByRole('button', { name: /^Cancel$/i });
    const cancel = byTestId.or(formCancelButton).first();
    await cancel.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cancel);
  }

  override async clickCreateAndSelectOption(option: 'With form' | 'From Form' | 'With YAML') {
    const optionSelectors: Record<string, string> = {
      'With form':
        'button[role="menuitem"]:has-text("From Form"), button[role="menuitem"]:has-text("With form"), [role="menuitem"]:has-text("With form")',
      'From Form':
        'button[role="menuitem"]:has-text("From Form"), button[role="menuitem"]:has-text("With form"), [role="menuitem"]:has-text("With form")',
      'With YAML':
        'button[role="menuitem"]:has-text("With YAML"), [role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption(this.testId('item-create'), optionSelectors[option]);
  }

  async clickCreateButton() {
    // Use text-based locator for the Create button in the form
    const createButton = this.page.locator('[role="dialog"] button', { hasText: 'Create' });
    await createButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await createButton.click();
  }

  /**
   * Clicks the delete action from the actions dropdown.
   */
  async clickDeleteAction() {
    const deleteAction = this.testId('mp-action-delete');
    await deleteAction.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(deleteAction);
  }

  /**
   * Clicks the save button in the delete confirmation modal.
   */
  async clickSaveButton() {
    const saveButton = this.testId('save-button');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
  }

  /**
   * Returns a locator scoped to the detail page content area for a given text pattern.
   * Useful for soft-asserting detail page values without exposing raw `page`.
   */
  detailContentLocator(text: string | RegExp) {
    return this.page.getByText(text).first();
  }

  async fillBandwidthPerMigration(bandwidth: string) {
    const bandwidthInput = this.testId('bandwidthPerMigration-selected').locator('input');
    await bandwidthInput.waitFor({ state: 'visible' });
    await bandwidthInput.click();
    await bandwidthInput.press('Control+a');
    await bandwidthInput.pressSequentially(bandwidth);
  }

  async fillCompletionTimeout(timeout: string) {
    const completionTimeoutInput = this.testId('migration-policy-completion-timeout-input').locator(
      'input',
    );
    await completionTimeoutInput.waitFor({ state: 'visible' });
    await completionTimeoutInput.click();
    await completionTimeoutInput.press('Control+a');
    await completionTimeoutInput.pressSequentially(timeout);
  }

  async fillDescription(description: string) {
    const descriptionInput = this.locator('[role="dialog"] input[type="text"]').nth(1);
    await descriptionInput.waitFor({ state: 'visible' });
    await descriptionInput.clear();
    await descriptionInput.fill(description);
  }

  // Form field interaction methods
  async fillPolicyName(name: string) {
    await this._nameInput.waitFor({ state: 'visible' });
    await this._nameInput.clear();
    await this._nameInput.fill(name);
  }

  /**
   * Reads the current bandwidth value and unit from the migration policy
   * create/edit form. The bandwidth field must already be visible.
   */
  async getBandwidthFieldInfo(): Promise<{
    value: string | null;
    unit: string | null;
  }> {
    const bandwidthSection = this.testId('bandwidthPerMigration-selected');
    await bandwidthSection.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const input = bandwidthSection.locator('input').first();
    const value = await input.inputValue();

    const unitButton = bandwidthSection.locator('button.pf-v6-c-menu-toggle').first();
    let unit: string | null = null;
    const unitVisible = await unitButton
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (unitVisible) {
      unit = (await unitButton.textContent())?.trim() || null;
    }

    return { value, unit };
  }

  /**
   * Gets the names of all visible migration policies on the page.
   * Extracts names from elements with data-test attributes like "policy-silver-planarian-22".
   *
   * @returns Array of policy names found on the page
   */
  async getExistingPolicyNames(): Promise<string[]> {
    try {
      const policyElements = this.locator('[data-test^="policy-"]');
      const count = await policyElements.count();

      if (count === 0) {
        return [];
      }

      const policyNames: string[] = [];
      for (let i = 0; i < count; i++) {
        const dataTestValue = await policyElements.nth(i).getAttribute('data-test');
        if (dataTestValue) {
          // Extract name from "policy-<name>" pattern
          const name = dataTestValue.replace('policy-', '');
          if (name && !policyNames.includes(name)) {
            policyNames.push(name);
          }
        }
      }

      return policyNames;
    } catch {
      return [];
    }
  }

  async getFormErrorMessage(): Promise<string> {
    const alertTitle = this.locator(
      '.pf-v6-c-alert__title, .pf-v5-c-alert__title, .pf-c-alert__title',
    );
    try {
      await alertTitle
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      const text = await alertTitle.first().textContent();
      if (text?.trim()) {
        return text.trim();
      }
    } catch {
      // continue to inline helpers
    }

    const inlineError = this.locator(
      '.pf-v6-c-form__helper-text.pf-m-error, .pf-v5-c-form__helper-text.pf-m-error, .pf-c-form__helper-text.pf-m-error',
    );
    try {
      await inlineError
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return ((await inlineError.first().textContent()) || '').trim();
    } catch {
      // Name field invalid + helper linked via aria-describedby (no alert on some builds)
    }

    const invalid = await this._nameInput.getAttribute('aria-invalid');
    if (invalid === 'true') {
      const describedBy = (await this._nameInput.getAttribute('aria-describedby'))
        ?.split(/\s+/)
        .find(Boolean);
      if (describedBy) {
        const helper = this.page.locator(`[id="${describedBy}"]`);
        try {
          await helper.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
          return ((await helper.textContent()) || '').trim();
        } catch {
          return '';
        }
      }
    }

    return '';
  }

  // Details page methods
  async getNameDetailsValue(policyName: string): Promise<string> {
    const descriptionLocator = this.locator('h1', { hasText: policyName });
    await descriptionLocator.waitFor({ state: 'visible' });

    return (await descriptionLocator.textContent()) || '';
  }

  /**
   * Returns true if the Create MigrationPolicy dropdown options (With form / With YAML) are visible.
   * Call after clicking the Create MigrationPolicy button to verify the creation flow is open.
   */
  async isCreateDropdownOptionsVisible(): Promise<boolean> {
    try {
      const withFormOption = this.locator('button[role="menuitem"]:has-text("From Form")');
      const withYamlOption = this.locator('button[role="menuitem"]:has-text("With YAML")');
      const dropdownOption = withFormOption.or(withYamlOption).first();
      await dropdownOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await dropdownOption.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Checks if a specific migration policy is visible on the page.
   *
   * @param policyName - The name of the policy to check
   * @returns true if the policy is visible, false otherwise
   */
  async isPolicyVisible(policyName: string): Promise<boolean> {
    try {
      const byDataTest = this.testId(`policy-${policyName}`);
      const byDataTestVisible = await byDataTest
        .isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => false);
      if (byDataTestVisible) return true;

      const byText = this.locator(`table a`, { hasText: policyName });
      return await byText
        .first()
        .isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  // Navigation methods
  /**
   * Navigates to Migration Policies via URL.
   * @deprecated Use navigateToMigrationPoliciesViaUI() for more reliable navigation
   */
  async navigateToMigrationPolicies() {
    await this.goTo('/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy');
  }

  /**
   * Navigates to Migration Policies page by clicking [data-test="migrationpolicies-nav-item"] (Fleet context).
   * Expands the Virtualization nav section first so the item is visible.
   */
  async navigateToMigrationPoliciesViaMigrationpoliciesNavItem(): Promise<void> {
    const navItem = this.testId('migrationpolicies-nav-item');
    await navItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(navItem);
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  /**
   * Navigates to Migration Policies page via sidebar UI click, falling back to URL navigation.
   */
  async navigateToMigrationPoliciesViaUI(): Promise<void> {
    await this.clickNavMigrationPolicies();
  }

  /**
   * Navigates to the migration policy detail page for a specific policy.
   * Tries clicking the policy link from the list page first (UI-first),
   * falling back to URL navigation. Waits for the detail page heading
   * to confirm the page has fully rendered.
   *
   * @param policyName - The name of the migration policy to navigate to
   *
   * @example
   * ```typescript
   * await migrationPoliciesPage.navigateToMigrationPolicyDetail('my-policy');
   * ```
   */
  async navigateToMigrationPolicyDetail(policyName: string) {
    const policyLink = this.testId(`policy-${policyName}`);
    try {
      await policyLink
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      await this.robustClick(policyLink.first());
    } catch {
      await this.goTo(`/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/${policyName}`);
    }
    await this.waitForDetailPageHeading(policyName);
  }

  /**
   * Opens the Cluster filter dropdown from the filter toolbar.
   */
  async openClusterFilter(): Promise<void> {
    await this._filterToolbarClusterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._filterToolbarClusterButton);
  }

  /**
   * Opens the Edit modal for a migration policy from its detail page.
   * Navigates to the detail page, clicks Actions → Edit MigrationPolicy.
   */
  async openEditPolicyModal(policyName: string): Promise<void> {
    await this.navigateToMigrationPolicyDetail(policyName);
    await this.clickActionsDropdown();
    const editAction = this.testId('mp-action-edit').or(
      this.locator('[role="menuitem"]:has-text("Edit MigrationPolicy")'),
    );
    await editAction.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(editAction.first());
    await this.waitForFormToLoad();
  }

  /**
   * Selects a cluster from the open filter menu (#checkbox-select li with the given cluster name).
   * Call after openClusterFilter().
   */
  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    const clusterOption = this.locator('#checkbox-select li', {
      hasText: clusterName,
    }).first();
    await clusterOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(clusterOption);
  }

  async selectConfiguration(
    configurationType:
      | 'Auto converge'
      | 'Bandwidth per migration'
      | 'Completion timeout'
      | 'Post-copy',
  ) {
    const dropdown = this.page.getByRole('button', { name: 'Add configuration' });
    await dropdown.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await dropdown.click();

    const optionLocator = this.page.getByRole('menuitem', { name: configurationType });
    await optionLocator.click();
  }

  async setAutoConverge(enable: boolean) {
    const container = this.testId('allowAutoConverge-selected');
    const toggle = container.locator('button.pf-v6-c-menu-toggle').first();
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();

    const optionText = enable ? 'Yes' : 'No';
    const option = this.page
      .locator('.pf-v6-c-menu__list [role="option"]')
      .filter({ hasText: optionText });
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await option.click();
  }

  async setPostCopy(enable: boolean) {
    const container = this.testId('allowPostCopy-selected');
    const toggle = container.locator('button.pf-v6-c-menu-toggle').first();
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();

    const optionText = enable ? 'Yes' : 'No';
    const option = this.page
      .locator('.pf-v6-c-menu__list [role="option"]')
      .filter({ hasText: optionText });
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await option.click();
  }

  /**
   * Verifies the filter toolbar contains a button with text "Cluster" (Fleet ACM).
   */
  async verifyClusterFilterButtonVisible(): Promise<boolean> {
    try {
      await this._filterToolbarClusterButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._filterToolbarClusterButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Verifies that the migration policies page is loaded.
   * Checks for multiple indicators: empty state, resource rows, table headers, or create button.
   * Uses combined locators with `or()` for robust detection.
   *
   * @param expectedPolicyNamesOrIndicators - Optional array of policy names fetched from K8s API to verify on UI, or indicator selectors for base class compatibility
   * @param includeCreateButton - Whether to include create button check (for base class compatibility, defaults to true)
   * @param timeout - Timeout in milliseconds (defaults to DEFAULT timeout)
   * @returns true if the page is loaded (empty or with policies), false otherwise
   */
  override async verifyPageLoaded(
    expectedPolicyNamesOrIndicators?: string[],
    includeCreateButton = true,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      // Wait for page to settle
      await this.page.waitForLoadState('domcontentloaded');

      // Build a combined locator for all possible "page loaded" indicators
      // 1. Empty state message
      const emptyStateLocator = this.locator('text=No MigrationPolicies found').first();

      // 2. Resource rows in the table (standard pattern for list pages)
      const resourceRowLocator = this._dataTestRowsResourceRow.first();

      // 3. Table headers (indicates table structure is loaded)
      const tableHeaderLocator = this.locator('th').filter({ hasText: 'Name' }).first();

      // Start with base indicators
      let combinedLocator = emptyStateLocator.or(resourceRowLocator).or(tableHeaderLocator);

      // 4. Create button (if requested)
      if (includeCreateButton) {
        combinedLocator = combinedLocator.or(
          this.testId('item-create').filter({ hasText: 'Create MigrationPolicy' }),
        );
      }

      // If specific policy names are provided, also check for rows containing those names
      if (expectedPolicyNamesOrIndicators && expectedPolicyNamesOrIndicators.length > 0) {
        for (const policyName of expectedPolicyNamesOrIndicators) {
          // Check for row containing the policy name (more flexible than exact data-test attribute)
          const policyRowLocator = this._dataTestRowsResourceRow
            .filter({ hasText: policyName })
            .first();
          combinedLocator = combinedLocator.or(policyRowLocator);

          // Also try link/anchor elements with the policy name
          const policyLinkLocator = this.locator('a', { hasText: policyName }).first();
          combinedLocator = combinedLocator.or(policyLinkLocator);
        }
      }

      // Wait for any indicator to be visible
      await combinedLocator.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for the detail page heading containing the policy name to be visible.
   * Used after navigation to confirm the detail page has fully rendered.
   */
  async waitForDetailPageHeading(
    policyName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this.locator('h1')
      .filter({ hasText: policyName })
      .first()
      .waitFor({ state: 'visible', timeout });
  }

  async waitForFormToLoad() {
    await this._nameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

  async waitForPolicyRowDetached(
    policyName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this.testId(`policy-${policyName}`).waitFor({
      state: 'detached',
      timeout,
    });
  }
}
