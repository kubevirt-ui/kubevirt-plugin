import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class OverviewQuickStartsComponent extends BaseComponent {
  private readonly _creatingVirtualMachineFromVolume = this.locator(
    '#creating-virtual-machine-from-volume',
  );
  private readonly _pfMDanger = this.locator('.pf-m-danger');
  private readonly _reviewFailed = this.locator('#review-failed');
  private readonly _reviewSuccess = this.locator('#review-success');
  private readonly _roleAlertPfMDanger = this.locator('[role="alert"].pf-m-danger');
  private readonly _status = this.locator('[data-test="status"]');

  constructor(page: Page) {
    super(page);
  }

  async checkQuickStartYesCheckbox() {
    const yesCheckbox = this.locator('[data-testid="qs-drawer-check-yes"]');
    await yesCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await yesCheckbox.check({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
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

  async clickQuickStartCloseButton() {
    const closeButton = this.locator('button:has-text("Close")');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(closeButton);
  }

  async clickQuickStartNextButton() {
    const nextButton = this.locator('button:has-text("Next")');
    await nextButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(nextButton);
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

  async navigateToQuickStart() {
    await this.goTo('/quickstart');
    await this.page.waitForTimeout(TestTimeouts.DATA_VOLUME_CREATION);
  }

  /**
   * Navigate to Quick Start page via UI by clicking the "All quick starts" sidebar item.
   * More reliable than URL-based navigation as it mimics user behavior.
   */
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

  async openCreateVmFromVolumeQuickStart() {
    await this._creatingVirtualMachineFromVolume.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._creatingVirtualMachineFromVolume.click({ force: true });
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

  async verifyDangerAlertVisible(): Promise<boolean> {
    const dangerAlert = this._roleAlertPfMDanger;
    try {
      await dangerAlert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await dangerAlert.isVisible();
    } catch {
      return false;
    }
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

  async verifySuccessAlertVisible(): Promise<boolean> {
    const successAlert = this.locator('[role="alert"].pf-m-success');
    try {
      await successAlert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await successAlert.isVisible();
    } catch {
      return false;
    }
  }
}
