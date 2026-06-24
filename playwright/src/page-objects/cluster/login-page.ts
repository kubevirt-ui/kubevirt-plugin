// LoginPage — Page object for login interactions.

import type { Page } from '@playwright/test';

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

  private _idpEntryByName(name: string): ReturnType<typeof this.locator> {
    const encoded = encodeURIComponent(name);
    return this.locator(`[title="Log in with ${name}"], a[href*="idp=${encoded}"]`);
  }
  private readonly _userDropdownToggle = this.locator('[data-test="user-dropdown-toggle"]');

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(baseUrl?: string) {
    const isLocalhost = baseUrl
      ? /localhost|127\.0\.0\.1/.test(baseUrl)
      : this.page.url().includes('localhost') || this.page.url().includes('127.0.0.1');

    if (isLocalhost) {
      await this.goTo('/');
    } else {
      await this.goTo('/auth/login');
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

  async clickKubeAdminLogin() {
    await this._kubeAdminButton.click();
  }

  async clickTestLogin(idpName?: string) {
    const entry = idpName ? this._idpEntryByName(idpName) : this._nonAdminIdpEntry.first();
    await entry.click();
  }

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
      await submitBtn.click();
    }
  }

  async performLogout() {
    const loggedUser = this.locator(
      '[data-test="user-dropdown"], [data-test="username"], [data-test="user-dropdown-toggle"]',
    ).first();
    const logoutBtn = this.locator('[data-test="log-out"]');
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

  async startImpersonating(username: string): Promise<void> {
    const toggle = this._userDropdownToggle;
    await toggle.waitFor({ state: 'visible', timeout: 15000 });
    await toggle.click();
    const impersonateItem = this.page.getByRole('menuitem', { name: 'Impersonate User' });
    await impersonateItem.waitFor({ state: 'visible', timeout: 10000 });
    await impersonateItem.click();
    const usernameInput = this.locator('[data-test="username-input"]');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill(username);
    const impersonateBtn = this.locator('[data-test="impersonate-button"]');
    await impersonateBtn.waitFor({ state: 'visible', timeout: 5000 });
    await impersonateBtn.click();
    // Wait for the impersonation banner to confirm the switch
    await this.page
      .locator('button:has-text("Stop impersonating")')
      .waitFor({ state: 'visible', timeout: 15000 });
  }

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
}
