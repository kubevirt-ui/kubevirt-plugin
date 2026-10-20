import { LoginPage } from '@/page-objects/cluster/login-page';
import { EnvVariables } from '@/utils/env-variables';
import { NONPRIV_IDP_NAME } from '@/utils/nonpriv-user-setup';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { BrowserContext, Page } from '@playwright/test';

async function waitForConsoleReady(page: Page): Promise<void> {
  await page
    .locator('[data-test-id="perspective-switcher-toggle"]')
    .waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
}

/**
 * Local `start-console.sh` bridge: `BRIDGE_USER_AUTH=disabled` — no login route, only load the app.
 */
export async function bootstrapLocalConsoleSession(page: Page, baseURL: string): Promise<void> {
  await page.goto(baseURL, { waitUntil: 'load', timeout: TestTimeouts.CONSOLE_LOGIN });
  await waitForConsoleReady(page);
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

  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: TestTimeouts.CONSOLE_LOGIN });

  const authDisabled = await page
    .evaluate(
      () => (window as { SERVER_FLAGS?: { authDisabled?: boolean } }).SERVER_FLAGS?.authDisabled,
    )
    .catch(() => false);

  if (authDisabled) {
    await waitForConsoleReady(page);
    return;
  }

  const loginPage = new LoginPage(page);
  if (!page.url().includes('/auth/login')) {
    await loginPage.navigateToLogin(baseURL);
  }

  if (EnvVariables.isNonPrivUser) {
    const idp = EnvVariables.idp || NONPRIV_IDP_NAME;
    const idpVisible = await loginPage.waitForIdpButtonWithReload(baseURL, idp);
    if (!idpVisible) {
      throw new Error(
        `Login IDP "${idp}" not found on the console login page. ` +
          `Run global setup with kubeadmin kubeconfig (ensure-nonpriv-idp-user rule) or set SKIP_NONPRIV_IDP_SETUP=1 on a pre-provisioned cluster.`,
      );
    }
    await page.waitForTimeout(SECOND);
    await loginPage.clickIdpLogin(idp);
  } else if (await loginPage.isKubeAdminButtonVisible()) {
    await loginPage.clickKubeAdminLogin();
  } else {
    await loginPage.clickIdpLogin(EnvVariables.idp);
  }

  await loginPage.fillAndSubmitLoginForm(EnvVariables.loginUsername, EnvVariables.loginPassword);

  await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
    timeout: TestTimeouts.CONSOLE_LOGIN,
  });
  await waitForConsoleReady(page);
}

export async function saveStorageState(
  context: BrowserContext,
  storageStatePath: string,
): Promise<void> {
  await context.storageState({ path: storageStatePath });
}
