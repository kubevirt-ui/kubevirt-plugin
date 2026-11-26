import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

const VIRTIO_DRIVERS_ALERT_DISMISSED_KEY = 'kubevirt-virtio-drivers-alert-dismissed';
const OUTDATED_DRIVERS_RECORDING_RULE = 'vmi:kubevirt_vmi_guest_device_driver_build_number:max';

type OutdatedVirtioVm = {
  name: string;
  namespace: string;
};

/** VM list VirtIO drivers warning alert (Windows VMs) and its dismiss / Downloads actions. */
export default class VmListVirtioAlertComponent extends BaseComponent {
  private readonly _alert = this.testId('virtio-drivers-alert');
  private readonly _mainAlertTitle = this._alert.getByText(/(?:has|have) outdated VirtIO drivers/i);
  private readonly _backupAlertTitle = this._alert.getByText(
    /Stay up to date with your VirtIO drivers/i,
  );
  private readonly _closeButton = this._alert.getByRole('button', { name: /^Close/i });
  private readonly _dontShowAgain = this.page.getByRole('checkbox', {
    name: /Don't show this message again/i,
  });
  private readonly _expandToggle = this._alert.getByRole('button', { name: /alert details/i });
  private readonly _getUpdatedDrivers = this._alert.getByRole('link', {
    name: 'Get updated drivers',
  });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Mocks Prometheus QUERY responses for the outdated VirtIO drivers recording rule.
   * Call before navigating to the VM list so the alert uses mocked series.
   */
  async mockOutdatedVirtioDrivers(vms: OutdatedVirtioVm[]): Promise<void> {
    await this.page.route('**/api/prometheus/api/v1/query*', async (route) => {
      const query = decodeURIComponent(route.request().url());

      if (!query.includes(OUTDATED_DRIVERS_RECORDING_RULE)) {
        await route.fallback();
        return;
      }

      const matchingVms = vms.filter((vm) => {
        if (query.includes(`namespace="${vm.namespace}"`)) {
          return true;
        }
        // All-namespaces query uses namespace!=""
        return query.includes('namespace!=""') || !query.includes('namespace=');
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            resultType: 'vector',
            result: matchingVms.map((vm) => ({
              metric: { name: vm.name, namespace: vm.namespace },
              value: [Date.now() / 1000, '1'],
            })),
          },
        }),
      });
    });
  }

  /**
   * Mocks a broken Prometheus by failing the outdated VirtIO drivers recording-rule query.
   * Call before navigating to the VM list to exercise the generic "backup" alert variant.
   */
  async mockPrometheusQueryError(): Promise<void> {
    await this.page.route('**/api/prometheus/api/v1/query*', async (route) => {
      const query = decodeURIComponent(route.request().url());

      if (!query.includes(OUTDATED_DRIVERS_RECORDING_RULE)) {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          errorType: 'internal',
          error: 'simulated Prometheus failure',
        }),
      });
    });
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

  async clickGetUpdatedDrivers(): Promise<void> {
    await this.expand();
    await this.robustClick(this._getUpdatedDrivers);
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
    await this._getUpdatedDrivers.waitFor({
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

  /** True when the count-based ("main") alert variant is shown. */
  async isMainVariantVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      await this._mainAlertTitle.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /** True when the generic ("backup") alert variant is shown. */
  async isBackupVariantVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      await this._backupAlertTitle.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
