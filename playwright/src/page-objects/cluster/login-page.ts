import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/**
 * OpenShift console login (aligned with kubevirt-ui release-5.0 LoginPage).
 * Used only from global auth setup — not from tests.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  private kubeAdminButton = this.page.locator(
    '[title="Log in with kube:admin"], a[href*="idp=kube%3Aadmin"]',
  );

  private idpEntry(idp: string) {
    const encoded = encodeURIComponent(idp);
    return this.page
      .locator(`[title="Log in with ${idp}"], a[href*="idp=${encoded}"], a[href*="idp=${idp}"]`)
      .or(this.page.getByRole('link', { name: idp }));
  }

  async navigateToLogin(baseUrl: string): Promise<void> {
    const root = baseUrl.replace(/\/$/, '');
    await this.page.goto(`${root}/auth/login`, {
      waitUntil: 'load',
      timeout: TestTimeouts.CONSOLE_LOGIN,
    });
  }

  async isKubeAdminButtonVisible(timeoutMs = 10 * SECOND): Promise<boolean> {
    return this.kubeAdminButton
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  async clickKubeAdminLogin(): Promise<void> {
    await this.kubeAdminButton.first().click();
  }

  async isIdpButtonVisible(idp: string, timeoutMs = 5 * SECOND): Promise<boolean> {
    const entry = this.idpEntry(idp);
    return entry
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  async waitForIdpButtonWithReload(
    baseUrl: string,
    idp: string,
    maxAttempts = 15,
    retryIntervalMs = 5 * SECOND,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (await this.isIdpButtonVisible(idp, 3 * SECOND)) {
        return true;
      }
      if (attempt < maxAttempts) {
        await this.navigateToLogin(baseUrl);
        await this.page.waitForTimeout(retryIntervalMs);
      }
    }
    return false;
  }

  async clickIdpLogin(idp: string): Promise<void> {
    const entry = this.idpEntry(idp);
    if (
      await entry
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await entry.first().click();
      return;
    }
    await this.page.getByRole('link', { name: idp }).click();
  }

  async fillAndSubmitLoginForm(username: string, password: string): Promise<void> {
    await this.page.locator('#inputUsername').fill(username);
    await this.page.locator('#inputPassword').fill(password);
    const coLogin = this.page.locator('#co-login-button');
    if (await coLogin.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await coLogin.click();
    } else {
      await this.page.locator('button[type="submit"]').click();
    }
  }
}
