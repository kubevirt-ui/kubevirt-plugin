import { Page } from '@playwright/test';

import { EnvVariables } from '@/utils/env-variables';

const NAV_TIMEOUT = 30_000;

/**
 * Page object for the Checkups page.
 * Injected via the scenarioTest fixture.
 */
export class CheckupsPage {
  constructor(private readonly page: Page) {}

  async navigate(ns = EnvVariables.cnvNamespace): Promise<void> {
    await this.page.goto(`/k8s/ns/${ns}/checkups`, { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('heading', { name: 'Checkups' }).waitFor({ timeout: NAV_TIMEOUT });
  }
}
