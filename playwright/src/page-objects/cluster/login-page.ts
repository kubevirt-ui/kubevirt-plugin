/**
 * Page object for the OpenShift console login page.
 * IDP helpers match CNV-98979 (`clickIdpLogin` / `navigateToIdpLogin` / named htpasswd IDP).
 */

import type { Page } from '@playwright/test';

import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';

import BasePage from '../base-page';

export default class LoginPage extends BasePage {
  // Cluster login pages use either <button title="Log in with X"> or <a href="...idp=X"> (link style)
  private readonly _kubeAdminButton = this.locator(
    '[title="Log in with kube:admin"], a[href*="idp=kube%3Aadmin"]',
  );
  // Any non-admin IDP entry — button style (title attr) or link style (idp= param, excluding kube:admin)
  private readonly _nonAdminIdpEntry = this.locator(
    '[title^="Log in with"]:not([title*="admin"]), a[href*="idp="]:not([href*="kube%3Aadmin"])',
  );

  private readonly _userDropdownToggle = this.testId('user-dropdown-toggle');
  constructor(page: Page) {
    super(page);
  }

  /**
   * Returns a locator targeting a specific IDP entry by name (e.g. "test-users").
   * Matches both button style (`title="Log in with test-users"`) and link style
   * (text content or `idp=test-users` href param) — same as CNV-98979.
   */
  private _idpEntryByName(name: string): ReturnType<typeof this.locator> {
    const encoded = encodeURIComponent(name);
    return this.locator(
      `[title="Log in with ${name}"], a[href*="idp=${encoded}"], a[href*="idp=${name}"]`,
    ).or(this.page.getByRole('link', { name }));
  }

  async clickKubeAdminLogin() {
    await this._kubeAdminButton.click();
  }

  /** CNV-98979: click a specific IDP entry by name. */
  async clickIdpLogin(idp: string): Promise<void> {
    const entry = this._idpEntryByName(idp);
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

  async clickTestLogin(idpName?: string) {
    if (idpName) {
      await this.clickIdpLogin(idpName);
      return;
    }
    await this._nonAdminIdpEntry.first().click();
  }

  async fillAndSubmitLoginForm(username: string, password: string) {
    await this.locator('[id="inputUsername"]').fill(username);
    await this.locator('[id="inputPassword"]').fill(password);
    // Some clusters show a dedicated login button (#co-login-button), others use a plain submit button
    const coLoginBtn = this.locator('[id="co-login-button"]');
    const submitBtn = this.locator('button[type="submit"]');
    const useCoLoginBtn = await coLoginBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (useCoLoginBtn) {
      await coLoginBtn.click();
    } else {
      await submitBtn
        .or(this.page.getByRole('button', { name: /^Log in$/i }))
        .first()
        .click();
    }
  }

  /** CNV-98979: visibility of a named IDP entry. */
  async isIdpButtonVisible(idp: string, timeoutMs = 5 * SECOND): Promise<boolean> {
    return this._idpEntryByName(idp)
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  /** Username/password form (after IDP choice or on clusters with no IDP list). */
  async isLoginFormVisible(timeoutMs = 5 * SECOND): Promise<boolean> {
    return this.locator('#inputUsername')
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  /**
   * Deep-link to an IDP (CNV-98979). With multiple providers the chooser may still appear.
   */
  async navigateToIdpLogin(baseUrl: string, idp: string): Promise<void> {
    const root = baseUrl.replace(/\/$/, '');
    const encoded = encodeURIComponent(idp);
    await this._gotoAuthToleratingAbort(`${root}/auth/login?idp=${encoded}`);
    await this.waitForLoginRouteReady();
  }

  /**
   * Console `/auth/login` redirects to oauth-openshift; wait for chooser or credential form.
   */
  async waitForLoginRouteReady(timeoutMs = TestTimeouts.CONSOLE_LOGIN): Promise<void> {
    await pollUntil(
      async () => (await this.isIdpSelectionVisible(500)) || (await this.isLoginFormVisible(500)),
      {
        message: 'OpenShift OAuth login (IDP chooser or credential form) should load',
        timeout: timeoutMs,
      },
    );
  }

  /** OAuth shows an IDP list when multiple providers exist (e.g. kube:admin + test-users). */
  async isIdpSelectionVisible(timeoutMs = 5 * SECOND): Promise<boolean> {
    const chooserHeading = this.page.getByRole('heading', { name: /^Log in with$/i });
    if (
      await chooserHeading
        .isVisible({ timeout: Math.min(timeoutMs, 3 * SECOND) })
        .catch(() => false)
    ) {
      return true;
    }
    if (await this.isKubeAdminButtonVisible({ timeout: timeoutMs })) {
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

  /** OAuth redirects often abort `load`; prefer `domcontentloaded` and ignore ERR_ABORTED. */
  private async _gotoAuthToleratingAbort(url: string): Promise<void> {
    try {
      await this.page.goto(url, {
        timeout: TestTimeouts.CONSOLE_LOGIN,
        waitUntil: 'domcontentloaded',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!/ERR_ABORTED|frame was detached/i.test(msg)) {
        throw error;
      }
    }
  }

  /** Open kubeadmin login form when the IDP picker is absent or kube:admin is offered. */
  async openKubeadminLoginForm(): Promise<void> {
    if (await this.isLoginFormVisible(2 * SECOND)) {
      return;
    }
    if (await this.isKubeAdminButtonVisible({ timeout: 3 * SECOND })) {
      await this.clickKubeAdminLogin();
      await this.locator('#inputUsername').waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return;
    }
    if (await this.isIdpButtonVisible('kube:admin', 2 * SECOND)) {
      await this.clickIdpLogin('kube:admin');
      await this.locator('#inputUsername').waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
  }

  /** Poll until a named IDP button appears (CNV-98979). */
  async waitForIdpButtonWithReload(
    baseUrl: string,
    idp: string,
    maxAttempts = 15,
    retryIntervalMs = 5 * SECOND,
  ): Promise<boolean> {
    return this.waitForTestButtonWithReload(baseUrl, {
      idpName: idp,
      maxAttempts,
      retryIntervalMs,
    });
  }

  /**
   * Returns the display name of the first non-admin IDP entry (button title or link text).
   * E.g. "test" on clusters with htpasswd IDP, "test@redhat.com" on others.
   * Falls back to "test" if the entry is not found.
   */
  async getNonPrivIdpUsername(options?: { timeout?: number }): Promise<string> {
    try {
      await this._nonAdminIdpEntry
        .first()
        .waitFor({ state: 'visible', timeout: options?.timeout ?? 5000 });
      const entry = this._nonAdminIdpEntry.first();
      // Link style: extract text content (e.g. "test@redhat.com")
      // Button style: read the title attribute and strip "Log in with " prefix
      const title = await entry.getAttribute('title');
      if (title) {
        return title.replace(/^Log in with\s*/i, '').trim();
      }
      const text = (await entry.textContent())?.trim();
      return text || 'test';
    } catch {
      return 'test';
    }
  }

  async isKubeAdminButtonVisible(options?: { timeout?: number }): Promise<boolean> {
    try {
      await this._kubeAdminButton.waitFor({ state: 'visible', timeout: options?.timeout ?? 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isTestButtonVisible(options?: { timeout?: number; idpName?: string }): Promise<boolean> {
    try {
      const entry = options?.idpName
        ? this._idpEntryByName(options.idpName)
        : this._nonAdminIdpEntry.first();
      await entry.waitFor({ state: 'visible', timeout: options?.timeout ?? 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async navigateToLogin(baseUrl?: string) {
    const isLocalhost = baseUrl
      ? /localhost|127\.0\.0\.1/.test(baseUrl)
      : this.page.url().includes('localhost') || this.page.url().includes('127.0.0.1');

    if (isLocalhost) {
      await this.goTo('/');
      return;
    }

    const root = (baseUrl || new URL(this.page.url()).origin).replace(/\/$/, '');
    await this._gotoAuthToleratingAbort(`${root}/auth/login`);
    await this.waitForLoginRouteReady();
  }

  async performLogout() {
    const loggedUser = this.testId('user-dropdown')
      .or(this.testId('username'))
      .or(this.testId('user-dropdown-toggle'))
      .first();
    const logoutBtn = this.testId('log-out');
    await loggedUser.waitFor({ state: 'visible', timeout: 30000 });
    await loggedUser.scrollIntoViewIfNeeded();
    // PF6 page drawer may overlap the header; use dispatchEvent as fallback
    try {
      await loggedUser.click({ timeout: 5000 });
    } catch {
      await loggedUser.dispatchEvent('click');
    }
    await logoutBtn.waitFor({ state: 'visible', timeout: 10000 });
    await logoutBtn.click();
  }

  /**
   * Impersonate a user via the OpenShift console user menu.
   * Opens the user menu → clicks "Impersonate User" → fills the username → submits.
   * The browser session will reflect the impersonated user's permissions until
   * {@link stopImpersonating} is called. No OAuth session switching is required.
   */
  async startImpersonating(username: string): Promise<void> {
    const toggle = this._userDropdownToggle;
    await toggle.waitFor({ state: 'visible', timeout: 15000 });
    await toggle.click();
    const impersonateItem = this.page.getByRole('menuitem', { name: 'Impersonate User' });
    await impersonateItem.waitFor({ state: 'visible', timeout: 10000 });
    await impersonateItem.click();
    const usernameInput = this.testId('username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill(username);
    const impersonateBtn = this.testId('impersonate-button');
    await impersonateBtn.waitFor({ state: 'visible', timeout: 5000 });
    await impersonateBtn.click();
    // Wait for the impersonation banner to confirm the switch
    await this.page
      .locator('button:has-text("Stop impersonating")')
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Stop impersonating and return to the original kubeadmin session.
   * Clicks the "Stop impersonating" button from the impersonation alert banner.
   */
  async stopImpersonating(): Promise<void> {
    const stopBtn = this.page.locator('button:has-text("Stop impersonating")');
    await stopBtn.waitFor({ state: 'visible', timeout: 10000 });
    await stopBtn.click();
    // Wait for header to show kubeadmin again
    await this._userDropdownToggle.waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  /**
   * Polls the login page with reloads until the non-admin IDP button appears.
   * Required after a fresh OAuth rollout: the OAuth server may take several seconds
   * to register the new IDP even after its pods are Ready.
   *
   * @param baseUrl - Console base URL, used to reload the login page on each attempt.
   * @param options.maxAttempts - Maximum reload attempts before giving up (default: 10).
   * @param options.retryIntervalMs - Wait between reloads in ms (default: 5000).
   * @param options.perAttemptTimeoutMs - Visibility check timeout per attempt (default: 3000).
   */
  async waitForTestButtonWithReload(
    baseUrl: string,
    options?: {
      maxAttempts?: number;
      retryIntervalMs?: number;
      perAttemptTimeoutMs?: number;
      idpName?: string;
    },
  ): Promise<boolean> {
    const maxAttempts = options?.maxAttempts ?? 10;
    const retryIntervalMs = options?.retryIntervalMs ?? 5_000;
    const perAttemptTimeoutMs = options?.perAttemptTimeoutMs ?? 3_000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const visible = await this.isTestButtonVisible({
        timeout: perAttemptTimeoutMs,
        idpName: options?.idpName,
      });
      if (visible) return true;
      if (attempt < maxAttempts) {
        await this.navigateToLogin(baseUrl);
        await this.page.waitForLoadState('load');
        await this.page.waitForTimeout(retryIntervalMs);
      }
    }
    return false;
  }
}
