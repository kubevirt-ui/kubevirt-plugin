import { expect, Locator, Page } from '@playwright/test';

import { MINUTE } from '../utils/constants';
import { env } from '../utils/env';
import { byTest } from '../utils/locators';

const USER_DROPDOWN_TOGGLE = 'user-dropdown-toggle';

const SEL = {
  passwordInput: '#inputPassword',
  submitButton: 'button[type=submit]',
  usernameInput: '#inputUsername',
} as const;

export class LoginPage {
  constructor(private readonly page: Page) {}

  private async isOpenShiftOAuthLoginPage(): Promise<boolean> {
    return this.page.getByRole('heading', { name: 'Log in to your account' }).isVisible();
  }

  private async loginViaOpenShiftOAuth(username: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }

  /** Wait until the console loads or a known login screen appears after redirect. */
  private async waitForLoginOrConsole(userDropdown: Locator) {
    const oauthLogin = this.page.getByRole('heading', { name: 'Log in to your account' });
    const htpasswdLogin = this.page.locator(SEL.usernameInput);

    await Promise.race([
      userDropdown.waitFor({ state: 'visible', timeout: MINUTE }),
      oauthLogin.waitFor({ state: 'visible', timeout: MINUTE }),
      htpasswdLogin.waitFor({ state: 'visible', timeout: MINUTE }),
    ]).catch(() => undefined);
  }

  /** Log in with the given credentials. Skips login if auth is disabled. */
  async login(
    idp = env.kubeadminIdp,
    username = env.kubeadminUsername,
    password = env.kubeadminPassword,
  ) {
    const userDropdown = byTest(this.page, USER_DROPDOWN_TOGGLE);

    await this.page.goto('/');
    await this.waitForLoginOrConsole(userDropdown);

    if (await userDropdown.isVisible()) return;

    const authDisabled = await this.page
      .evaluate(
        () =>
          (window as Window & { SERVER_FLAGS?: { authDisabled?: boolean } }).SERVER_FLAGS
            ?.authDisabled,
      )
      .catch(() => false);

    if (authDisabled) return;

    if (await this.isOpenShiftOAuthLoginPage()) {
      await this.loginViaOpenShiftOAuth(username, password);
      await expect(userDropdown).toBeVisible({ timeout: MINUTE });
      return;
    }

    // Console bridge htpasswd login with optional IDP picker
    const bodyText = await this.page.locator('body').innerText();
    if (bodyText.includes(idp)) {
      await this.page.getByText(idp).click();
    }

    await this.page.locator(SEL.usernameInput).fill(username);
    await this.page.locator(SEL.passwordInput).fill(password);
    await this.page.locator(SEL.submitButton).click();

    await expect(userDropdown).toBeVisible({ timeout: MINUTE });
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
