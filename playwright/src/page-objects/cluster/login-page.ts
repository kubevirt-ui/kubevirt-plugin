import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/**
 * OpenShift oauth-openshift login (IDP chooser + htpasswd form).
 * Used only from global auth setup — not from tests.
 */
export class LoginPage {
  private kubeAdminLink = this.page
    .getByRole('link', { name: 'kube:admin' })
    .or(this.page.locator('a[href*="idp=kube%3Aadmin"]'));

  constructor(private readonly page: Page) {}

  private idpEntry(idp: string) {
    const encoded = encodeURIComponent(idp);
    return this.page
      .getByRole('link', { name: idp })
      .or(this.page.locator(`a[href*="idp=${encoded}"], a[href*="idp=${idp}"]`))
      .or(this.page.locator(`[title="Log in with ${idp}"]`));
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

  async clickKubeAdminLogin(): Promise<void> {
    await this.kubeAdminLink.first().click();
  }

  async fillAndSubmitLoginForm(username: string, password: string): Promise<void> {
    await this.page.locator('#inputUsername').fill(username);
    await this.page.locator('#inputPassword').fill(password);
    const submit = this.page
      .getByRole('button', { name: /^Log in$/i })
      .or(this.page.locator('#co-login-button'))
      .or(this.page.locator('button[type="submit"]'));
    await submit.first().click();
  }

  async isIdpButtonVisible(idp: string, timeoutMs = 5 * SECOND): Promise<boolean> {
    const entry = this.idpEntry(idp);
    return entry
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  /**
   * OAuth shows an IDP list (“Log in with”) when multiple providers exist (e.g. kube:admin + test-users).
   * When only one provider applies, the username/password form may appear with no chooser.
   */
  async isIdpSelectionVisible(timeoutMs = 5 * SECOND): Promise<boolean> {
    const chooserHeading = this.page.getByRole('heading', { name: /^Log in with$/i });
    if (
      await chooserHeading
        .isVisible({ timeout: Math.min(timeoutMs, 3 * SECOND) })
        .catch(() => false)
    ) {
      return true;
    }
    if (await this.isKubeAdminLinkVisible(timeoutMs)) {
      return true;
    }
    const idpLinks = this.page.locator('a[href*="idp="]');
    if ((await idpLinks.count()) > 0) {
      return idpLinks
        .first()
        .isVisible({ timeout: Math.min(timeoutMs, 3 * SECOND) })
        .catch(() => false);
    }
    return false;
  }

  async isKubeAdminLinkVisible(timeoutMs = 10 * SECOND): Promise<boolean> {
    return this.kubeAdminLink
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  /** @deprecated Use {@link isKubeAdminLinkVisible} */
  async isKubeAdminButtonVisible(timeoutMs = 10 * SECOND): Promise<boolean> {
    return this.isKubeAdminLinkVisible(timeoutMs);
  }

  /** Username/password form (after IDP choice or on clusters with no IDP list). */
  async isLoginFormVisible(timeoutMs = 5 * SECOND): Promise<boolean> {
    return this.page
      .locator('#inputUsername')
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  /** Console `/auth/login` redirects to oauth-openshift; wait for chooser or credential form. */
  async waitForLoginRouteReady(timeoutMs = TestTimeouts.CONSOLE_LOGIN): Promise<void> {
    await pollUntil(
      async () => (await this.isIdpSelectionVisible(500)) || (await this.isLoginFormVisible(500)),
      {
        message: 'OpenShift OAuth login (IDP chooser or credential form) should load',
        timeout: timeoutMs,
      },
    );
  }

  /**
   * Deep-link to an IDP; with multiple providers the chooser may still appear before the form.
   */
  async navigateToIdpLogin(baseUrl: string, idp: string): Promise<void> {
    const root = baseUrl.replace(/\/$/, '');
    const encoded = encodeURIComponent(idp);
    await this.page.goto(`${root}/auth/login?idp=${encoded}`, {
      timeout: TestTimeouts.CONSOLE_LOGIN,
      waitUntil: 'load',
    });
    await this.waitForLoginRouteReady();
  }

  async navigateToLogin(baseUrl: string): Promise<void> {
    const root = baseUrl.replace(/\/$/, '');
    await this.page.goto(`${root}/auth/login`, {
      timeout: TestTimeouts.CONSOLE_LOGIN,
      waitUntil: 'load',
    });
    await this.waitForLoginRouteReady();
  }

  /** Open kubeadmin login form when the IDP picker is absent or kube:admin is offered. */
  async openKubeadminLoginForm(): Promise<void> {
    if (await this.isLoginFormVisible(2 * SECOND)) {
      return;
    }
    if (await this.isKubeAdminButtonVisible(3 * SECOND)) {
      await this.clickKubeAdminLogin();
      await this.page
        .locator('#inputUsername')
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return;
    }
    const kubeIdp = this.idpEntry('kube:admin');
    if (
      await kubeIdp
        .first()
        .isVisible({ timeout: 2 * SECOND })
        .catch(() => false)
    ) {
      await kubeIdp.first().click();
      await this.page
        .locator('#inputUsername')
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    }
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
}
