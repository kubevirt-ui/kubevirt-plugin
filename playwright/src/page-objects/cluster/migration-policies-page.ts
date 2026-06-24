// MigrationPoliciesPage — Page object for migration policies interactions.

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class MigrationPoliciesPage extends PageCommons {
  override readonly _createButton = this.locator('[data-test="item-create"]');

  private readonly _filterToolbarClusterButton = this.locator(
    '[data-test="filter-toolbar"] button.pf-v6-c-menu-toggle',
  )
    .filter({ hasText: 'Cluster' })
    .first();

  private readonly _nameInput = this.page.getByRole('textbox', {
    name: /MigrationPolicy name/i,
  });

  private readonly _dataTestRowsResourceRow = this.locator('[data-test-rows="resource-row"]');

  constructor(page: Page) {
    super(page);
  }

  async clickCancelButton() {
    const byTestId = this.locator('[data-test-id="modal-cancel-action"]');
    const formCancelButton = this.page
      .locator('.migration-policy__form')
      .getByRole('button', { name: /^Cancel$/i });
    const cancel = byTestId.or(formCancelButton).first();
    await cancel.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cancel);
  }

  override async clickCreateAndSelectOption(option: 'From Form' | 'With form' | 'With YAML') {
    const optionSelectors: Record<string, string> = {
      'With form':
        'button[role="menuitem"]:has-text("From Form"), button[role="menuitem"]:has-text("With form"), [role="menuitem"]:has-text("With form")',
      'From Form':
        'button[role="menuitem"]:has-text("From Form"), button[role="menuitem"]:has-text("With form"), [role="menuitem"]:has-text("With form")',
      'With YAML':
        'button[role="menuitem"]:has-text("With YAML"), [role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption('[data-test="item-create"]', optionSelectors[option]);
  }

  async clickCreateButton() {
    const createButton = this.page.getByRole('button', { name: 'Create', exact: true });
    await createButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await createButton.click();
  }

  async fillBandwidthPerMigration(bandwidth: string) {
    const bandwidthInput = this.locator('[data-test-id="bandwidthPerMigration-selected"] input');
    await bandwidthInput.waitFor({ state: 'visible' });
    await bandwidthInput.click();
    await bandwidthInput.press('Control+a');
    await bandwidthInput.pressSequentially(bandwidth);
  }

  async fillCompletionTimeout(timeout: string) {
    const completionTimeoutInput = this.locator(
      '[data-test-id="migration-policy-completion-timeout-input"] input',
    );
    await completionTimeoutInput.waitFor({ state: 'visible' });
    await completionTimeoutInput.click();
    await completionTimeoutInput.press('Control+a');
    await completionTimeoutInput.pressSequentially(timeout);
  }

  async fillDescription(description: string) {
    const descriptionInput = this.page.getByRole('textbox', { name: /description/i });
    await descriptionInput.waitFor({ state: 'visible' });
    await descriptionInput.clear();
    await descriptionInput.fill(description);
  }

  // Form field interaction methods
  async fillPolicyName(name: string) {
    await this._nameInput.waitFor({ state: 'visible' });
    await this._nameInput.clear();
    await this._nameInput.fill(name);
    if (!name) {
      await this._nameInput.blur();
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
      '.pf-v6-c-helper-text__item.pf-m-error, ' +
        '.pf-v6-c-form__helper-text.pf-m-error, ' +
        '.pf-v5-c-form__helper-text.pf-m-error, ' +
        '.pf-c-form__helper-text.pf-m-error',
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

    // Return the text from the description list (more reliable)
    return (await descriptionLocator.textContent()) || '';
  }

  // Navigation methods
  async navigateToMigrationPolicies() {
    await this.goTo('/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy');
  }

  async navigateToMigrationPoliciesViaUI(): Promise<void> {
    try {
      await this.navigation.clickNavMigrationPolicies();
    } catch {
      await this.navigateToMigrationPolicies();
    }
  }

  async navigateToMigrationPoliciesViaMigrationpoliciesNavItem(): Promise<void> {
    const navItem = this.locator('[data-test-id="migrationpolicies-nav-item"]');
    await navItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(navItem);
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async navigateToMigrationPolicyDetail(policyName: string) {
    await this.goTo(`/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/${policyName}`);
  }

  async verifyDetailPageShowsText(
    text: RegExp | string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    const loc = this.page.getByText(text).first();
    try {
      await loc.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

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

  async openClusterFilter(): Promise<void> {
    await this._filterToolbarClusterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._filterToolbarClusterButton);
  }

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

    // Dynamically build the locator based on the option text
    const optionLocator = this.locator(`button:has-text("${configurationType}")`);
    await optionLocator.click();
  }

  async setAutoConverge(enable: boolean) {
    const autoConvergeToggle = this.locator('[data-test-id="allowAutoConverge-selected"] button');
    await autoConvergeToggle.waitFor({ state: 'visible' });
    await autoConvergeToggle.click();

    // Select Yes or No based on the boolean value
    const optionText = enable ? 'Yes' : 'No';
    const optionLocator = this.locator(`button:has-text("${optionText}")`);
    await optionLocator.click();
  }

  async setPostCopy(enable: boolean) {
    const postCopyToggle = this.locator('[data-test-id="allowPostCopy-selected"] button');
    await postCopyToggle.waitFor({ state: 'visible' });
    await postCopyToggle.click();

    // Select Yes or No based on the boolean value
    const optionText = enable ? 'Yes' : 'No';
    const optionLocator = this.locator(`button:has-text("${optionText}")`);
    await optionLocator.click();
  }

  async waitForFormToLoad() {
    await this._nameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

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
          this.locator('[data-test="item-create"]', { hasText: 'Create MigrationPolicy' }),
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

  async isPolicyVisible(policyName: string): Promise<boolean> {
    try {
      const policyLocator = this.locator(`[data-test="policy-${policyName}"]`);
      return await policyLocator
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async waitForPolicyRowDetached(
    policyName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this.locator(`[data-test="policy-${policyName}"]`).waitFor({
      state: 'detached',
      timeout,
    });
  }

  async openEditPolicyModal(policyName: string): Promise<void> {
    await this.navigateToMigrationPolicyDetail(policyName);
    await this.vmActions.clickActionsDropdown();
    const editAction = this.locator('[data-test-id="mp-action-edit"]').or(
      this.locator('[role="menuitem"]:has-text("Edit MigrationPolicy")'),
    );
    await editAction.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(editAction.first());
    await this.waitForFormToLoad();
  }

  async getBandwidthFieldInfo(): Promise<{
    value: null | string;
    unit: null | string;
  }> {
    const bandwidthSection = this.locator('[data-test-id="bandwidthPerMigration-selected"]');
    await bandwidthSection.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const input = bandwidthSection.locator('input').first();
    const value = await input.inputValue();

    const unitButton = bandwidthSection.locator('button.pf-v6-c-menu-toggle').first();
    let unit: null | string = null;
    const unitVisible = await unitButton
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (unitVisible) {
      unit = (await unitButton.textContent())?.trim() || null;
    }

    return { value, unit };
  }

  async clickActionsDropdown() {
    const actionsDropdown = this.page
      .locator('[data-test="actions-dropdown"]')
      .or(this.page.getByRole('button', { name: 'Actions' }));
    await actionsDropdown.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(actionsDropdown.first());
  }

  async clickDeleteAction() {
    const deleteAction = this.page
      .getByRole('menuitem', { name: 'Delete' })
      .or(this.page.locator('[data-test-action="Delete"]'))
      .or(this.page.locator('[role="menu"] >> text=Delete'));
    await deleteAction
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(deleteAction.first());
  }

  async clickConfirmDeleteButton() {
    const modal = this.page.locator('[role="dialog"], .pf-v6-c-modal-box, .modal-content');
    await modal.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const deleteBtn = modal.first().getByRole('button', { name: 'Delete', exact: true });
    await deleteBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await deleteBtn.click();
  }
}
