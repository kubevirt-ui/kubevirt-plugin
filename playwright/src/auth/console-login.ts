import { LoginPage } from '@/page-objects/cluster/login-page';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { NONPRIV_IDP_NAME } from '@/utils/nonpriv-user-setup';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { BrowserContext, Page } from '@playwright/test';

async function loginNonPrivHtpasswdIdp(
  page: Page,
  baseURL: string,
  loginPage: LoginPage,
): Promise<void> {
  const idp = EnvVariables.idp || NONPRIV_IDP_NAME;
  const username = EnvVariables.loginUsername;
  const password = EnvVariables.loginPassword;

  if (await loginPage.isIdpButtonVisible(idp, 3 * SECOND)) {
    await page.waitForTimeout(SECOND);
    await loginPage.clickIdpLogin(idp);
  } else if (await loginPage.isLoginFormVisible(3 * SECOND)) {
    logger.info(`Non-priv login: credential form visible (implicit IDP "${idp}")`);
  } else {
    await loginPage.navigateToIdpLogin(baseURL, idp);
    if (!(await loginPage.isLoginFormVisible(10 * SECOND))) {
      const idpVisible = await loginPage.waitForIdpButtonWithReload(baseURL, idp);
      if (!idpVisible) {
        throw new Error(
          `Non-priv global setup: could not open login for IDP "${idp}". ` +
            'Check htpasswd IDP provisioning and oauth-openshift rollout.',
        );
      }
      await page.waitForTimeout(SECOND);
      await loginPage.clickIdpLogin(idp);
    }
  }

  await loginPage.fillAndSubmitLoginForm(username, password);
}

async function waitForConsoleReady(page: Page, baseURL?: string): Promise<void> {
  const toggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
  try {
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
    return;
  } catch (error) {
    if (!baseURL) {
      throw error;
    }
    logger.warn('Console shell not ready after login — reloading console and retrying once');
    await page.goto(baseURL, {
      waitUntil: 'domcontentloaded',
      timeout: TestTimeouts.CONSOLE_LOGIN,
    });
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
  }
}

/**
 * Local `start-console.sh` bridge: `BRIDGE_USER_AUTH=disabled` — no login route, only load the app.
 */
export async function bootstrapLocalConsoleSession(page: Page, baseURL: string): Promise<void> {
  await page.goto(baseURL, { waitUntil: 'load', timeout: TestTimeouts.CONSOLE_LOGIN });
  await waitForConsoleReady(page, baseURL);
}

/**
 * OpenShift console auth for global setup (remote OAuth or auth-disabled bridge).
 * Not used from specs.
 */
export async function loginToOpenShiftConsole(page: Page, baseURL: string): Promise<void> {
  if (EnvVariables.isLocalMode) {
    await bootstrapLocalConsoleSession(page, baseURL);
    return;
  }

  await page.goto(baseURL, {
    waitUntil: 'domcontentloaded',
    timeout: TestTimeouts.CONSOLE_LOGIN,
  });

  const authDisabled = await page
    .evaluate(
      () => (window as { SERVER_FLAGS?: { authDisabled?: boolean } }).SERVER_FLAGS?.authDisabled,
    )
    .catch(() => false);

  if (authDisabled) {
    await waitForConsoleReady(page, baseURL);
    return;
  }

  const loginPage = new LoginPage(page);
  if (!page.url().includes('/auth/login')) {
    await loginPage.navigateToLogin(baseURL);
  }

  if (EnvVariables.isNonPrivUser) {
    await loginNonPrivHtpasswdIdp(page, baseURL, loginPage);
  } else if (!(await loginPage.isIdpSelectionVisible())) {
    logger.info(
      'Console login: no IDP selection (test-users IDP not configured) — using kubeadmin login',
    );
    await loginPage.openKubeadminLoginForm();
    await loginPage.fillAndSubmitLoginForm(EnvVariables.username, EnvVariables.password);
  } else if (await loginPage.isKubeAdminButtonVisible()) {
    await loginPage.clickKubeAdminLogin();
    await loginPage.fillAndSubmitLoginForm(EnvVariables.loginUsername, EnvVariables.loginPassword);
  } else {
    await loginPage.clickIdpLogin(EnvVariables.idp);
    await loginPage.fillAndSubmitLoginForm(EnvVariables.loginUsername, EnvVariables.loginPassword);
  }

  await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
    timeout: TestTimeouts.CONSOLE_LOGIN,
  });

  const loginError = page.locator('.pf-c-alert.pf-m-danger, [data-test="login-error"]');
  if (await loginError.isVisible({ timeout: 2 * SECOND }).catch(() => false)) {
    const message = (await loginError.textContent())?.trim() || 'unknown login error';
    throw new Error(`OpenShift login failed: ${message}`);
  }

  await waitForConsoleReady(page, baseURL);
}

export async function saveStorageState(
  context: BrowserContext,
  storageStatePath: string,
): Promise<void> {
  await context.storageState({ path: storageStatePath });
}
