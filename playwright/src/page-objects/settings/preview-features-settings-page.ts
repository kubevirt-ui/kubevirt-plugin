import type { Locator, Page } from '@playwright/test';

import { SECOND } from 'utils/constants';
import { env } from '../../../utils/env';

const PREVIEW_FEATURES_TAB = 'Preview features';
const VSOCK_FEATURE_ID = 'vsockEnabled';
const WAIT_VSOCK_TOGGLE = SECOND;

/**
 * Page object for the Virtualization Settings page.
 * Covers navigation and interaction with the Preview Features tab,
 * specifically the VSOCK toggle.
 */
export class PreviewFeaturesSettingsPage {
  readonly heading: Locator;
  readonly previewFeaturesTab: Locator;
  readonly vsockSwitch: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Settings' });
    this.previewFeaturesTab = page.getByRole('tab', {
      exact: true,
      name: PREVIEW_FEATURES_TAB,
    });
    this.vsockSwitch = page.locator(`[data-test-id="${VSOCK_FEATURE_ID}"]`);
  }

  async disableVsock(): Promise<void> {
    await this.navigateToPreviewFeatures();
    const isOn = await this.vsockSwitch.isChecked();
    if (isOn) {
      await this.vsockSwitch.locator('..').click();
      await this.page.waitForTimeout(WAIT_VSOCK_TOGGLE);
    }
  }

  async enableVsock(): Promise<void> {
    await this.navigateToPreviewFeatures();
    const isOn = await this.vsockSwitch.isChecked();
    if (!isOn) {
      await this.vsockSwitch.locator('..').click();
      await this.page.waitForTimeout(WAIT_VSOCK_TOGGLE);
    }
  }

  async navigate(): Promise<void> {
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/virtualization-settings`, {
      waitUntil: 'domcontentloaded',
    });
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
  }

  async navigateToPreviewFeatures(): Promise<void> {
    await this.navigate();
    await this.previewFeaturesTab.click();
    await this.vsockSwitch.waitFor({ state: 'visible', timeout: 30_000 });
  }
}
