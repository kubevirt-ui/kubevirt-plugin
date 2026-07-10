import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class ModalComponent extends BaseComponent {
  private readonly _modalTitle = this.locator('.pf-v5-c-modal-box__title, .pf-c-modal-box__title');
  private readonly _welcomeModal = this.locator('#guided-tour-modal');
  private readonly _welcomeModalCloseButton = this.locator(
    '[id="guided-tour-modal"] button[aria-label="Close"]',
  );
  readonly _confirmActionButton = this.locator('[data-test="confirm-action"]');

  constructor(page: Page) {
    super(page);
  }

  private async _tryCloseGenericBackdropModal(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      const backdrop = this.page.locator('.pf-v5-c-backdrop, .pf-v6-c-backdrop');
      await backdrop.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });

      const closeBtn = this.page.locator('[aria-label="Close"]').first();
      await closeBtn.click({ force: true, timeout: TestTimeouts.UI_DELAY_SHORT });
      await backdrop.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      return true;
    } catch {
      return false;
    }
  }

  async clickCancel(): Promise<void> {
    await this.clickCancelInModal();
  }

  async clickCancelInModal(): Promise<void> {
    await this.locator('button:has-text("Cancel")').click();
  }

  async clickConfirm(): Promise<void> {
    await this.clickConfirmInModal();
  }

  async clickConfirmAction(): Promise<void> {
    await this._confirmActionButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
    await this.robustClick(this._confirmActionButton);
  }

  async clickConfirmInModal(): Promise<void> {
    await this.locator('button:has-text("Confirm")').click();
  }

  async clickOkInModal(): Promise<void> {
    await this.locator('button:has-text("OK")').click();
  }

  async closeModal(): Promise<void> {
    const closeButton = this.locator(
      '[aria-label="Close"], .pf-v5-c-modal-box__close, .pf-c-modal-box__close',
    );
    await this.robustClick(closeButton);
  }

  async closeModalByX(): Promise<void> {
    await this.locator('[aria-label="Close"]').click();
    await this._modalTitle.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
  }

  async closeWelcomeModal(): Promise<void> {
    await this._welcomeModalCloseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._welcomeModalCloseButton);
  }

  async getModalBody(): Promise<string> {
    const modalBody = this.locator('.pf-v5-c-modal-box__body, .pf-c-modal-box__body');
    return (await modalBody.textContent()) || '';
  }

  async getModalTitle(): Promise<string> {
    return (await this._modalTitle.textContent()) || '';
  }

  async isModalVisible(): Promise<boolean> {
    try {
      await this._modalTitle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async isWelcomeModalVisible(): Promise<boolean> {
    try {
      await this._welcomeModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async tryCloseWelcomeModal(): Promise<boolean> {
    try {
      await this._welcomeModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });

      try {
        await this._welcomeModalCloseButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_SHORT,
        });
        await this.robustClick(this._welcomeModalCloseButton);
        await this._welcomeModal.waitFor({
          state: 'hidden',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        return true;
      } catch {
        try {
          const modalCloseButton = this._welcomeModal.locator('[aria-label="Close"]').first();
          await modalCloseButton.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_SHORT,
          });
          await this.robustClick(modalCloseButton);
          await this._welcomeModal.waitFor({
            state: 'hidden',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          return true;
        } catch {
          return false;
        }
      }
    } catch {
      return this._tryCloseGenericBackdropModal();
    }
  }
}
