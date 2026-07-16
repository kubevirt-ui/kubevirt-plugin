/**
 * Auth Healer — detects expired browser sessions and re-authenticates.
 *
 * During long test runs the OpenShift OAuth session stored in the Playwright
 * storage state can expire.  When that happens the console redirects to the
 * login page and every subsequent test fails.
 *
 * This module provides:
 *   1. `isOnLoginPage(page)` — fast check on current URL / DOM
 *   2. `healBrowserAuth(page, context)` — performs full re-login and
 *      persists the updated storage state to disk so other workers and
 *      future tests pick it up.
 *   3. `refreshApiToken()` — re-authenticates via OAuth and updates the
 *      shared TestConfig + RequestContextClient singleton so API-only
 *      operations (SpecResourceSetup, beforeAll) continue to work.
 */

import { createApiClientFromToken, getApiClient, resetApiClient } from '@/clients/rcc-singleton';
import LoginPage from '@/page-objects/cluster/login-page';
import { EnvVariables } from '@/utils/env-variables';
import { FileUtils } from '@/utils/file-utils';
import { logger } from '@/utils/logger';
import { fetchOAuthToken } from '@/utils/oauth-token';
import { getStorageStatePath } from '@/utils/storage-state';
import { TestConfigManager, TestTimeouts } from '@/utils/test-config';
import type { BrowserContext, Page } from '@playwright/test';

const LOGIN_URL_PATTERNS = ['/auth/login', '/oauth/authorize', '/login'];
const RE_LOGIN_LOCK = { inProgress: false };

/**
 * Returns true when the page's current URL looks like a login/oauth page.
 */
export function isOnLoginPage(page: Page): boolean {
  const url = page.url();
  return LOGIN_URL_PATTERNS.some((p) => url.includes(p));
}

/**
 * Detect auth expiry heuristically:
 *   - Page URL is a login/oauth page after a goto()
 *   - The login form's username input is visible
 */
export async function detectAuthExpired(page: Page): Promise<boolean> {
  if (isOnLoginPage(page)) return true;

  try {
    const loginInput = page.locator('[id="inputUsername"]');
    const visible = await loginInput.isVisible({ timeout: TestTimeouts.UI_DELAY_TRANSITION });
    return visible;
  } catch {
    return false;
  }
}

/**
 * Perform a full browser re-login and persist the updated storage state.
 *
 * Returns `true` if re-login succeeded, `false` otherwise.
 */
export async function healBrowserAuth(page: Page, context: BrowserContext): Promise<boolean> {
  if (RE_LOGIN_LOCK.inProgress) {
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
    return !isOnLoginPage(page);
  }

  RE_LOGIN_LOCK.inProgress = true;
  try {
    logger.info('[AuthHealer] Session expired — performing re-login…');

    const loginPage = new LoginPage(page);
    const baseUrl = EnvVariables.webConsoleUrl;

    await loginPage.navigateToLogin(baseUrl);
    await page.waitForLoadState('load');

    const isNonPriv = EnvVariables.isNonPrivUser;
    if (!isNonPriv) {
      const kubeAdminVisible = await loginPage.isKubeAdminButtonVisible({
        timeout: TestTimeouts.MIGRATION_POLICY_VERIFICATION,
      });
      if (kubeAdminVisible) {
        await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await loginPage.clickKubeAdminLogin();
      }
    } else {
      const testVisible = await loginPage.isTestButtonVisible({
        timeout: TestTimeouts.MIGRATION_POLICY_VERIFICATION,
      });
      if (testVisible) {
        await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await loginPage.clickTestLogin();
      }
    }

    await loginPage.fillAndSubmitLoginForm(
      EnvVariables.uiLoginUsername,
      EnvVariables.uiLoginPassword,
    );

    await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await page.waitForLoadState('load');
    logger.info(`[AuthHealer] Re-login complete — redirected to ${page.url()}`);

    await dismissWelcomeModals(page);

    const playwrightDir = FileUtils.resolvePath(__dirname, '..', '..');
    const storageStatePath = getStorageStatePath(playwrightDir);
    if (storageStatePath) {
      try {
        await context.storageState({ path: storageStatePath });
        logger.info(`[AuthHealer] Updated storage state saved to ${storageStatePath}`);
      } catch {
        logger.warn('[AuthHealer] Could not save storage state (non-fatal)');
      }
    }

    await refreshApiToken();

    return true;
  } catch (error) {
    logger.warn(`[AuthHealer] Re-login failed: ${error}`);
    return false;
  } finally {
    RE_LOGIN_LOCK.inProgress = false;
  }
}

/**
 * Refresh the OAuth API token used by RequestContextClient.
 *
 * Uses the OAuth token endpoint (same as global.setup) to get a fresh token,
 * then updates the shared test config and resets the client singleton.
 */
export async function refreshApiToken(): Promise<boolean> {
  const clusterUrl = EnvVariables.clusterUrl;
  const username = EnvVariables.username;
  const password = EnvVariables.password;

  if (!clusterUrl || clusterUrl === 'undefined') {
    return false;
  }

  try {
    const token = await fetchOAuthToken(clusterUrl, username, password);
    if (!token) return false;

    const config = TestConfigManager.getConfig();
    config.authToken = token;
    TestConfigManager.saveConfig(config);

    TestConfigManager.clearCache();

    resetApiClient();

    // Re-create the singleton with the fresh token
    await createApiClientFromToken(token);

    logger.info('[AuthHealer] API token refreshed successfully');
    return true;
  } catch (error) {
    logger.warn(`[AuthHealer] API token refresh failed: ${error}`);
    return false;
  }
}

/**
 * Pre-flight check for API auth.
 *
 * Call this from SpecResourceSetup or beforeAll hooks to ensure
 * the Kubernetes API token is still valid. If not, attempts refresh.
 */
export async function ensureApiAuth(): Promise<void> {
  const client = getApiClient();
  if (!client) {
    await refreshApiToken();
    return;
  }

  try {
    await client.verifyAuthentication();
  } catch {
    logger.info('[AuthHealer] API auth check failed — refreshing token…');
    await refreshApiToken();
  }
}

async function dismissWelcomeModals(page: Page): Promise<void> {
  try {
    const tourFooter = page.locator('[data-test="tour-step-footer-secondary"]');
    const visible = await tourFooter
      .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
      .then(() => true)
      .catch(() => false);
    if (visible) {
      await tourFooter.click();
      await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
  } catch {
    // no modal
  }

  try {
    const welcomeCheckbox = page.locator('#welcome-modal-checkbox');
    const visible = await welcomeCheckbox
      .isVisible({ timeout: TestTimeouts.UI_DELAY_EXTRA })
      .catch(() => false);
    if (visible) {
      await welcomeCheckbox.check({ force: true }).catch(() => undefined);
      const closeBtn = page.locator('.pf-v6-c-modal-box__close button');
      await closeBtn.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
  } catch {
    // no modal
  }
}
