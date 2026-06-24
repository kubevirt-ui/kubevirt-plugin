import { OverviewSettingsComponent } from '@/components/overview/overview-settings-components';
import BaseComponent from '@/components/shared/base-component';
import { SECRET_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class OverviewQuickStartsComponent extends BaseComponent {
  private readonly _creatingVirtualMachineFromVolume = this.locator(
    '#creating-virtual-machine-from-volume',
  );
  private readonly _reviewFailed = this.locator('#review-failed');
  private readonly _pfMDanger = this.locator('.pf-m-danger');
  private readonly _reviewSuccess = this.locator('#review-success');
  private readonly _status = this.locator('[data-test="status"]');
  private readonly _roleAlertPfMDanger = this.locator('[role="alert"].pf-m-danger');

  constructor(page: Page) {
    super(page);
  }

  async navigateToQuickStart() {
    await this.goTo('/quickstart');
    await this.page.waitForTimeout(TestTimeouts.DATA_VOLUME_CREATION);
  }

  async navigateToQuickStartViaUI(): Promise<void> {
    await this.dismissBlockingModals();

    const allQuickStartsItem = this.locator('[data-test="item all-quick-starts"]');
    await allQuickStartsItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(allQuickStartsItem);
    await this.locator('[data-test="title"]').first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async dismissBlockingModals(): Promise<void> {
    try {
      const welcomeModal = this.page.locator(
        '[role="dialog"]:has-text("Welcome to"), [role="dialog"]:has-text("OpenShift Virtualization")',
      );

      const appeared = await welcomeModal
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .then(() => true)
        .catch(() => false);

      if (!appeared) return;

      const closeBtn = welcomeModal.first().locator('button[aria-label="Close"]');
      const closeBtnVisible = await closeBtn.isVisible().catch(() => false);

      if (closeBtnVisible) {
        await closeBtn.click({ force: true });
      } else {
        await this.page.keyboard.press('Escape');
      }

      await welcomeModal
        .first()
        .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    } catch {
      /* no modal */
    }
  }

  async openCreateVmFromVolumeQuickStart() {
    await this._creatingVirtualMachineFromVolume.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._creatingVirtualMachineFromVolume.click({ force: true });
  }

  async handleQuickStartRestartIfNeeded() {
    const restartButton = this.locator('button:has-text("Restart")');
    const visible = await restartButton
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
      .then(() => true)
      .catch(() => false);
    if (visible) {
      await this.robustClick(restartButton.first());
    }
  }

  async clickQuickStartStartButton() {
    const candidates = [
      this.locator('[data-testid="qs-drawer-start"]'),
      this.locator('button:has-text("Start")'),
      this.locator('button:has-text("Resume")'),
      this.locator('button:has-text("Continue")'),
    ];
    for (const btn of candidates) {
      const visible = await btn
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
        .then(() => true)
        .catch(() => false);
      if (visible) {
        await this.robustClick(btn.first());
        return;
      }
    }
    throw new Error('Could not find Start/Resume/Continue button in quick start drawer');
  }

  async verifyReviewFailed(): Promise<boolean> {
    try {
      const reviewFailed = this._reviewFailed;
      await reviewFailed.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.robustClick(reviewFailed);
      const dangerClass = this._pfMDanger;
      await dangerClass.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await dangerClass.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyReviewSuccess(): Promise<boolean> {
    try {
      const reviewSuccess = this._reviewSuccess;
      await reviewSuccess.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(reviewSuccess);
      const dangerClass = this._pfMDanger;
      const successClass = this.locator('.pf-m-success');

      await successClass.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const dangerExists = await dangerClass.isVisible().catch(() => false);
      const successExists = await successClass.isVisible().catch(() => false);

      return !dangerExists && successExists;
    } catch {
      return false;
    }
  }

  async checkQuickStartYesCheckbox() {
    const yesCheckbox = this.locator('[data-testid="qs-drawer-check-yes"]');
    await yesCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await yesCheckbox.check({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickQuickStartNextButton() {
    const nextButton = this.locator('button:has-text("Next")');
    await nextButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(nextButton);
  }

  async verifyQuickStartSuccessMessage(): Promise<boolean> {
    try {
      const successMessage = this.locator('text=The virtual machine was created successfully.');
      await successMessage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await successMessage.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async clickQuickStartCloseButton() {
    const closeButton = this.locator('button:has-text("Close")');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(closeButton);
  }

  async verifyQuickStartComplete(): Promise<boolean> {
    try {
      await this._status.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._status.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async clickQuickStartByTitle(title: string): Promise<void> {
    const quickStartTitle = this.locator('[data-test="title"]', { hasText: title });
    const titleVisible = await quickStartTitle
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);

    if (titleVisible) {
      await quickStartTitle.click({ force: true });
      return;
    }

    const fallbackTitle = this.page.getByText(title, { exact: false });
    await fallbackTitle.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await fallbackTitle.first().click({ force: true });
  }

  async clickReviewFailed(): Promise<void> {
    const reviewFailed = this._reviewFailed;
    await reviewFailed.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await reviewFailed.click();
  }

  async clickReviewSuccess(): Promise<void> {
    const reviewSuccess = this._reviewSuccess;
    await reviewSuccess.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await reviewSuccess.click();
  }

  async verifyDangerAlertVisible(): Promise<boolean> {
    const dangerAlert = this._roleAlertPfMDanger;
    try {
      await dangerAlert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await dangerAlert.isVisible();
    } catch {
      return false;
    }
  }

  async verifyDangerAlertNotVisible(): Promise<boolean> {
    const dangerAlert = this._roleAlertPfMDanger;
    try {
      await dangerAlert.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifySuccessAlertVisible(): Promise<boolean> {
    const successAlert = this.locator('[role="alert"].pf-m-success');
    try {
      await successAlert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await successAlert.isVisible();
    } catch {
      return false;
    }
  }

  async verifyQuickStartTileComplete(tileId: string): Promise<boolean> {
    const tile = this.locator(`#${tileId}`);
    try {
      await tile.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const statusByAttr = tile.locator('[data-test="status"]', { hasText: 'Complete' });
      if (await statusByAttr.isVisible().catch(() => false)) return true;

      const completeText = tile.getByText('Complete');
      if (await completeText.isVisible().catch(() => false)) return true;

      const completeBadge = tile.locator(
        '.pf-v6-c-label, .pf-c-label, [class*="complete"], [class*="success"]',
      );
      if ((await completeBadge.count()) > 0) {
        const badgeText = await completeBadge
          .first()
          .textContent()
          .catch(() => '');
        if (badgeText?.toLowerCase().includes('complete')) return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}

export class OverviewSshKeysComponent extends BaseComponent {
  private readonly _userButton = this.locator('button[role="tab"]', {
    hasText: 'User',
  });
  private readonly _manageSSHKeysBtn = this.locator('button:has-text("Manage SSH keys")');
  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');

  constructor(page: Page) {
    super(page);
  }

  async navigateToSSHKeysManagement() {
    await new OverviewSettingsComponent(this.page).navigateToSettingsViaSidebar();

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

  async selectProjectByNamespace(namespace: string): Promise<void> {
    const selectProjectToggle = this.locator('[data-test-id="select-project-toggle"]');

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

    const namespaceOption = this.locator(
      `#select-inline-filter-${namespace} [data-test-id="${namespace}"]`,
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

  async selectProjectInSSHSettings(projectName: string): Promise<void> {
    const sshSection = this.locator('[data-test-id="settings-user-ssh-key"]');
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

    const sshToggle = sshSection.locator('[data-test-id="select-project-toggle"]');

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
        .or(this.locator('[data-test-id="select-project-toggle"] + * input'))
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
      await this.locator('[data-test="user-settings"] h6', {
        hasText: 'Public SSH key',
      }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this.locator('[data-test="user-settings"] h6', {
        hasText: 'Public SSH key',
      })
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
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
}
