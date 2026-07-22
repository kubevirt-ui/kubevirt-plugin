import BaseComponent from '@/components/shared/base-component';
import { SECRET_NAMES } from '@/data-models';
import OverviewSettingsPage from '@/page-objects/overview/overview-settings-page';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export default class OverviewSshKeysComponent extends BaseComponent {
  private readonly _manageSSHKeysBtn = this.locator('button:has-text("Manage SSH keys")');
  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');
  private readonly _userButton = this.locator('button[role="tab"]', {
    hasText: 'User',
  });

  constructor(page: Page) {
    super(page);
  }

  async navigateToSSHKeysManagement() {
    await new OverviewSettingsPage(this.page).navigateToSettingsViaSidebar();

    await this._userButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._userButton);

    await this._manageSSHKeysBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._manageSSHKeysBtn);

    await this.page
      .waitForLoadState('domcontentloaded', { timeout: TestTimeouts.UI_ACTION_COMPLETE })
      .catch(() => {
        return;
      });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async saveSSHKey(
    secretName: string = SECRET_NAMES.TEST_SECRET,
    filePath = './.test-data/rsa.pub',
  ): Promise<boolean> {
    const targetSecretBtn = this.locator('button.project-ssh-row__secret-name').last();
    await targetSecretBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(targetSecretBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const addNewButton = this.locator('#addNew');
    await addNewButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await addNewButton.check({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const uploadSecretInput = this.locator('.ssh-key-upload__file-upload input[hidden]');
    await uploadSecretInput.waitFor({
      state: 'attached',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    await uploadSecretInput.setInputFiles(filePath);

    const secretNameInput = this.locator('#new-secret-name');
    await secretNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await secretNameInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await secretNameInput.type(secretName, { delay: 150 });

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const saveButton = this.locator('button:has-text("Save")');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const buttonReady = await this.waitForCondition(
      async () => {
        try {
          const isNotDisabled = await saveButton
            .evaluate((el) => {
              const hasDisabledAttr = el.hasAttribute('disabled');
              const ariaDisabled = el.getAttribute('aria-disabled') === 'true';
              return !hasDisabledAttr && !ariaDisabled;
            })
            .catch(() => false);

          if (!isNotDisabled) {
            return false;
          }

          const isEnabled = await saveButton.isEnabled().catch(() => false);

          return isEnabled;
        } catch {
          return false;
        }
      },
      TestTimeouts.UI_ELEMENT_VISIBILITY,
      TestTimeouts.UI_DELAY_SHORT,
    );

    if (!buttonReady) {
      const diagnostics = await saveButton
        .evaluate((el) => {
          return {
            hasDisabledAttr: el.hasAttribute('disabled'),
            ariaDisabled: el.getAttribute('aria-disabled'),
            hasProgressClass: el.classList.contains('pf-m-progress'),
            className: el.className,
          };
        })
        .catch(() => ({ error: 'Could not evaluate button state' }));

      throw new Error(
        `Save button did not become enabled within timeout period. ` +
          `Button state: ${JSON.stringify(diagnostics)}. ` +
          `Button may be stuck in progress state or form validation may have failed.`,
      );
    }

    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const secretButton = this.locator(`button:has-text("${secretName}")`);
    await secretButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return await secretButton.isVisible();
  }

  async selectProjectByNamespace(namespace: string): Promise<void> {
    const selectProjectToggle = this.testId('select-project-toggle');

    await this.page
      .waitForLoadState('domcontentloaded', { timeout: TestTimeouts.UI_ACTION_COMPLETE })
      .catch(() => {
        return;
      });

    const { waitForCondition: waitForConditionPoll } = await import('@/utils/wait-helpers');
    const toggleVisible = await waitForConditionPoll(
      async () => {
        try {
          const isVisible = await selectProjectToggle.isVisible({
            timeout: TestTimeouts.RETRY_DELAY,
          });
          return isVisible;
        } catch {
          return false;
        }
      },
      TestTimeouts.UI_ACTION_COMPLETE,
      TestTimeouts.RETRY_DELAY,
    );

    if (!toggleVisible) {
      throw new Error(
        `Project toggle button did not become visible within ${TestTimeouts.UI_ACTION_COMPLETE}ms`,
      );
    }

    await selectProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(selectProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._selectInlineFilterInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._selectInlineFilterInput.clear();
    await this._selectInlineFilterInput.pressSequentially(namespace, { delay: 300 });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    const namespaceOption = this.locator(`#select-inline-filter-${namespace}`).getByTestId(
      namespace,
    );
    await namespaceOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      namespaceOption,
      `Namespace "${namespace}" should be visible in project dropdown to allow selection`,
    ).toBeVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(namespaceOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  /**
   * In SSH keys settings, ensure the target project has a row for SSH key configuration.
   * If the project already has an entry, returns immediately.
   * Otherwise, clicks "Add public SSH key to project" and selects the project from the dropdown.
   */
  async selectProjectInSSHSettings(projectName: string): Promise<void> {
    const sshSection = this.testId('settings-user-ssh-key');
    await sshSection.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const addButton = this.locator('button:has-text("Add public SSH key to project")');
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const existingRow = sshSection.locator('.pf-v6-l-grid.pf-v6-u-mb-sm').filter({
      has: this.locator('.ssh-auth-row__project-name', { hasText: projectName }),
    });
    const hasExistingEntry = await existingRow
      .first()
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);

    if (hasExistingEntry) {
      const removeBtn = existingRow.first().locator('.pf-v6-c-button.pf-m-plain');
      await removeBtn.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    const sshToggle = sshSection.getByTestId('select-project-toggle');

    const maxAddAttempts = 4;
    for (let addAttempt = 1; addAttempt <= maxAddAttempts; addAttempt++) {
      const hasEmptyRow = await sshToggle
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);

      if (hasEmptyRow) break;

      await addButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      if (addAttempt <= 2) {
        await addButton.click({ force: true, timeout: 5000 }).catch(() => undefined);
      } else {
        await addButton.evaluate((el) => (el as HTMLElement).click());
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const appeared = await sshToggle
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (appeared) break;
    }

    const targetToggle = sshToggle.last();

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await targetToggle.waitFor({
          state: 'visible',
          timeout: 30000,
        });
      } catch {
        if (attempt === maxAttempts) {
          throw new Error(
            `Project toggle not visible after ${maxAttempts} attempts. ` +
              `The "Add public SSH key to project" button click may not have produced a new row.`,
          );
        }
        await addButton.click({ force: true }).catch(() => undefined);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
        continue;
      }

      try {
        await targetToggle.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
      } catch {
        await targetToggle.dispatchEvent('click');
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const filterInput = this.locator('input[placeholder="Select project"]')
        .or(this._selectInlineFilterInput)
        .or(this.testId('select-project-toggle').locator('+ * input'))
        .or(this.locator('.pf-v6-c-menu-toggle input, .pf-v6-c-select__toggle input'))
        .last();

      try {
        await filterInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
        await filterInput.clear();
        await filterInput.pressSequentially(projectName, { delay: 80 });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

        const projectOption = this.locator(`#select-inline-filter-${projectName}`)
          .or(this.locator(`[id*="${projectName}"]`).filter({ hasText: projectName }))
          .or(
            this.locator(
              `button:has-text("${projectName}"), [role="option"]:has-text("${projectName}")`,
            ),
          )
          .first();

        await projectOption.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_VISIBILITY_QUICK,
        });
        await this.robustClick(projectOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
        return;
      } catch {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }

    throw new Error(
      `Failed to select project '${projectName}' in SSH settings after ${maxAttempts} attempts`,
    );
  }

  async verifyPublicSSHKeyVisible(): Promise<boolean> {
    try {
      await this.testId('user-settings').locator('h6', { hasText: 'Public SSH key' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this.testId('user-settings')
        .locator('h6', { hasText: 'Public SSH key' })
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }
}
