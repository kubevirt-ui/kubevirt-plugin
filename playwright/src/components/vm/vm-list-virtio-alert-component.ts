import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

const VIRTIO_DRIVERS_ALERT_DISMISSED_KEY = 'kubevirt-virtio-drivers-alert-dismissed';

/** VM list VirtIO drivers warning alert (Windows VMs) and its dismiss / Downloads actions. */
export default class VmListVirtioAlertComponent extends BaseComponent {
  private readonly _alert = this.testId('virtio-drivers-alert');
  private readonly _closeButton = this._alert.getByRole('button', { name: /^Close/i });
  private readonly _dontShowAgain = this.page.getByRole('checkbox', {
    name: /Don't show this message again/i,
  });
  private readonly _expandToggle = this._alert.getByRole('button', { name: /alert details/i });
  private readonly _goToDownloads = this._alert.getByRole('link', { name: 'Go to Downloads' });

  constructor(page: Page) {
    super(page);
  }

  async checkDontShowAgain(): Promise<void> {
    await this.expand();
    if (await this._dontShowAgain.isChecked()) {
      return;
    }
    await this.robustClick(this._dontShowAgain);
  }

  async getDismissedFromLocalStorage(): Promise<string | null> {
    return this.page.evaluate(
      (key) => localStorage.getItem(key),
      VIRTIO_DRIVERS_ALERT_DISMISSED_KEY,
    );
  }

  async clickGoToDownloads(): Promise<void> {
    await this.expand();
    await this.robustClick(this._goToDownloads);
  }

  async close(): Promise<void> {
    await this._closeButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._closeButton);
    await this._alert.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async expand(): Promise<void> {
    await this._alert.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    const expanded = await this._expandToggle.getAttribute('aria-expanded');
    if (expanded === 'true') {
      return;
    }
    await this.robustClick(this._expandToggle);
    await this._goToDownloads.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async isVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      await this._alert.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
