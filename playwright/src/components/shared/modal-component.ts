// ModalComponent — UI component for modal interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class ModalComponent extends BaseComponent {
  private readonly _modalTitle = this.locator(
    '.pf-v6-c-modal-box__title, .pf-v5-c-modal-box__title, .pf-c-modal-box__title',
  );
  private readonly _modalBox = this.locator(
    '[role="dialog"], .pf-v6-c-modal-box, .pf-v5-c-modal-box',
  );
  private readonly _welcomeModal = this.locator('#guided-tour-modal');
  private readonly _welcomeModalCloseButton = this.locator(
    '[id="guided-tour-modal"] button[aria-label="Close"]',
  );
  private readonly _confirmActionButton = this.locator('[data-test="confirm-action"]');

  constructor(page: Page) {
    super(page);
  }

  async clickCancelInModal(): Promise<void> {
    await this.locator('button:has-text("Cancel")').click();
  }

  async clickCancel(): Promise<void> {
    await this.clickCancelInModal();
  }

  async clickConfirmInModal(): Promise<void> {
    await this.locator('button:has-text("Confirm")').click();
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

  async clickOkInModal(): Promise<void> {
    await this.locator('button:has-text("OK")').click();
  }

  async closeModalByX(): Promise<void> {
    await this.locator('[aria-label="Close"]').click();
    await this._modalTitle.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
  }

  async closeModal(): Promise<void> {
    const closeButton = this.locator(
      '[aria-label="Close"], .pf-v5-c-modal-box__close, .pf-c-modal-box__close',
    );
    await this.robustClick(closeButton);
  }

  async getModalBody(): Promise<string> {
    const modalBody = this.locator('.pf-v5-c-modal-box__body, .pf-c-modal-box__body');
    return (await modalBody.textContent()) || '';
  }

  async getModalTitle(): Promise<string> {
    return (await this._modalTitle.textContent()) || '';
  }

  async isModalVisible(timeout = TestTimeouts.UI_DELAY_MEDIUM): Promise<boolean> {
    try {
      await this._modalBox.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isModalVisibleWithText(
    text: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      await this._modalBox.first().waitFor({ state: 'visible', timeout });
      const found = await this._modalBox.first().getByText(text).isVisible({ timeout });
      return found;
    } catch {
      return false;
    }
  }

  async clickModalButtonByName(name: string): Promise<void> {
    const button = this._modalBox.first().getByRole('button', { name });
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(button);
  }

  async closeWelcomeModal(): Promise<void> {
    await this._welcomeModalCloseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._welcomeModalCloseButton);
  }

  async tryCloseWelcomeModal(): Promise<boolean> {
    try {
      await this._welcomeModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
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
      return false;
    }
  }

  async isWelcomeModalVisible(): Promise<boolean> {
    try {
      await this._welcomeModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      return true;
    } catch {
      return false;
    }
  }
}
