/**
 * VirtualMachine detail — Overview alerts card and Prometheus rules mocking.
 */

import BaseComponent from '@/components/shared/base-component';
import { MOCK_ENDPOINTS, MockResponses } from '@/utils/mock-responses';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VirtualMachineDetailAlertsComponent extends BaseComponent {
  private readonly _alertsCard = this.locator('.alerts-card__drawer');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Asserts that the `.alert-item__more` element (the "View warning/alert" link) is nested
   * inside `.alert-item__message`, verifying the DOM structure fix for CNV-85160.
   * Returns true when the structure is correct.
   */
  async assertAlertMoreLinkInsideMessage(): Promise<boolean> {
    const alertItem = this._alertsCard.locator('.alert-item').first();
    await alertItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const moreInsideMessage = await alertItem.evaluate((el) => {
      const message = el.querySelector('.alert-item__message');
      const more = el.querySelector('.alert-item__more');
      return !!message && !!more && message.contains(more);
    });
    return moreInsideMessage;
  }

  /**
   * Removes the Prometheus rules route mock set up by mockPrometheusRulesWithWarning.
   */
  async clearPrometheusRulesMock(): Promise<void> {
    await this.page.unroute(`${MOCK_ENDPOINTS.PROMETHEUS_RULES}*`);
  }

  /**
   * Expands the main alerts accordion toggle in the AlertsCard.
   * Required before accessing individual alert severity sections.
   */
  async expandAlertsAccordion(): Promise<void> {
    await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    const mainToggle = this._alertsCard.locator('#toggle-main');
    const isExpanded = (await mainToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.robustClick(mainToggle);
    }
  }

  /**
   * Expands the Warning severity accordion inside the AlertsCard.
   * Call expandAlertsAccordion() first.
   */
  async expandWarningSeverityAccordion(): Promise<void> {
    const warningToggle = this._alertsCard.locator('#warning');
    await warningToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isExpanded = (await warningToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.robustClick(warningToggle);
    }
  }

  /**
   * Returns the text content of the "View warning/alert" link inside the first visible alert item.
   */
  async getAlertMoreLinkText(): Promise<string> {
    const moreLink = this._alertsCard.locator('.alert-item__more a').first();
    await moreLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await moreLink.textContent())?.trim() || '';
  }

  /**
   * Intercepts the Prometheus rules API and returns a mock response with a warning alert
   * for the given VM. Call this BEFORE navigating to the VM detail page so the route is
   * registered when the page's useVMAlerts hook fires its first request.
   *
   * The mock matches both `/api/prometheus/api/v1/rules` and `/api/prometheus/api/v1/rules?`
   * (the trailing-? variant is used by some polling intervals).
   */
  async mockPrometheusRulesWithWarning(vmName: string, namespace: string): Promise<void> {
    const mockBody = MockResponses.createPrometheusAlertsResponse(vmName, namespace);
    await this.page.route(`${MOCK_ENDPOINTS.PROMETHEUS_RULES}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBody),
      });
    });
  }

  async verifyAlertsCard(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies the VirtualMachineStuckInUnhealthyState warning is visible in the alerts card.
   * This warning appears when the VM has been in provisioning/starting/terminating/error state for too long.
   */
  async verifyVirtualMachineStuckInUnhealthyStateWarningVisible(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const alertContent = this._alertsCard.locator('text=VirtualMachineStuckInUnhealthyState');
      await alertContent.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies the VMCannotBeEvicted warning is visible in the alerts card.
   * This warning appears when eviction strategy is LiveMigrate but the VM is not migratable (e.g. on SNO).
   */
  async verifyVMCannotBeEvictedWarningVisible(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const alertContent = this._alertsCard.locator('text=VMCannotBeEvicted');
      await alertContent.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }
}
