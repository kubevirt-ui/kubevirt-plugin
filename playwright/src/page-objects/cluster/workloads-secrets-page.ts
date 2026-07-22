/**
 * Page object for the Workloads Secrets page.
 * Handles navigation and visibility checks for secrets.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class WorkloadsSecretsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isSecretVisible(
    secretName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    const secretLocator = this.testId(secretName);
    try {
      await secretLocator.waitFor({ state: 'visible', timeout });
      return await secretLocator.isVisible();
    } catch {
      return false;
    }
  }

  async navigateToSecrets(namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/core~v1~Secret`);
    await this.page.waitForLoadState('networkidle', { timeout: TestTimeouts.NAVIGATION });
  }
}
