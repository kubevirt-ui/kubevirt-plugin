import { expect, Page } from '@playwright/test';

import { env } from '../utils/env';

const SEL = {
  loginButton: '[data-test-id=login], [data-test=login]',
  passwordInput: '#inputPassword',
  submitButton: 'button[type=submit]',
  userDropdown: '[data-test="user-dropdown-toggle"]',
  usernameInput: '#inputUsername',
} as const;

export class LoginPage {
  constructor(private readonly page: Page) {}

  /** Log in with the given credentials. Skips login if auth is disabled. */
  async login(
    idp = env.kubeadminIdp,
    username = env.kubeadminUsername,
    password = env.kubeadminPassword,
  ) {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');

    // Skip login when the console runs with auth disabled
    const authDisabled = await this.page.evaluate(
      () =>
        (window as Window & { SERVER_FLAGS?: { authDisabled?: boolean } }).SERVER_FLAGS
          ?.authDisabled,
    );
    if (authDisabled) return;

    // Already logged in
    if (await this.page.locator(SEL.userDropdown).isVisible()) return;

    // IDP selection screen
    const bodyText = await this.page.locator('body').innerText();
    if (bodyText.includes(idp)) {
      await this.page.getByText(idp).click();
    }

    await this.page.locator(SEL.usernameInput).fill(username);
    await this.page.locator(SEL.passwordInput).fill(password);
    await this.page.locator(SEL.submitButton).click();

    await expect(this.page.locator(SEL.userDropdown)).toBeVisible({ timeout: 60_000 });
  }

  /** Seed guided-tour completion into localStorage so tour banners never appear. */
  async seedGuidedTourState() {
    await this.page.addInitScript(() => {
      const KEY = 'console-user-settings';
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      } catch {
        /* ignore */
      }
      const tour = (data['console.guidedTour'] ?? {}) as Record<string, unknown>;
      ['admin', 'virtualization-perspective'].forEach((p) => {
        (tour as Record<string, unknown>)[p] = { completed: true };
      });
      data['console.guidedTour'] = tour;
      localStorage.setItem(KEY, JSON.stringify(data));
    });
  }
}
