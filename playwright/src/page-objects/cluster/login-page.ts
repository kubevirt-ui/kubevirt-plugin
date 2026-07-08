import type { Page } from '@playwright/test';

const SECOND = 1000;

/**
 * Page object for the OpenShift OAuth login page.
 * Handles IDP selection, form filling, and login submission.
 */
export default class LoginPage {
  constructor(private readonly page: Page) {}

  async clickKubeAdminLogin(): Promise<void> {
    const btn = this.page.locator('[title="Log in with kube:admin"], a[href*="idp=kube%3Aadmin"]');
    await btn.click();
  }

  async clickTestLogin(idpName = 'test-users'): Promise<void> {
    const btn = this.page.locator(`a:has-text("${idpName}")`);
    await btn.click();
  }

  async fillAndSubmitLoginForm(username: string, password: string): Promise<void> {
    await this.page.locator('#inputUsername').fill(username);
    await this.page.locator('#inputPassword').fill(password);

    const coLoginBtn = this.page.locator('#co-login-button');
    const submitBtn = this.page.locator('button[type="submit"]');
    const useCoLogin = await coLoginBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (useCoLogin) {
      await coLoginBtn.click();
    } else {
      await submitBtn.click();
    }
  }

  async isKubeAdminButtonVisible(opts?: { timeout?: number }): Promise<boolean> {
    const timeout = opts?.timeout ?? 10 * SECOND;
    const btn = this.page.locator('[title="Log in with kube:admin"], a[href*="idp=kube%3Aadmin"]');
    return btn
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async isTestButtonVisible(opts?: { timeout?: number; idpName?: string }): Promise<boolean> {
    const timeout = opts?.timeout ?? 10 * SECOND;
    const idpName = opts?.idpName ?? 'test-users';
    const btn = this.page.locator(`a:has-text("${idpName}")`);
    return btn
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async navigateToLogin(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/auth/login`, {
      timeout: 60 * SECOND,
      waitUntil: 'load',
    });
  }

  async waitForTestButtonWithReload(
    baseUrl: string,
    opts: {
      maxAttempts?: number;
      retryIntervalMs?: number;
      perAttemptTimeoutMs?: number;
      idpName?: string;
    },
  ): Promise<boolean> {
    const maxAttempts = opts.maxAttempts ?? 10;
    const retryIntervalMs = opts.retryIntervalMs ?? 5 * SECOND;
    const perAttemptTimeoutMs = opts.perAttemptTimeoutMs ?? 3 * SECOND;
    const idpName = opts.idpName ?? 'test-users';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const visible = await this.isTestButtonVisible({
        timeout: perAttemptTimeoutMs,
        idpName,
      });
      if (visible) return true;

      if (attempt < maxAttempts) {
        await this.page.waitForTimeout(retryIntervalMs);
        await this.navigateToLogin(baseUrl);
        await this.page.waitForLoadState('load');
      }
    }
    return false;
  }
}
