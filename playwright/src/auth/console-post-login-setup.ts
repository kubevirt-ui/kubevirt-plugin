import { csrfTokenFromPlaywrightCookies } from '@/utils/console-kubernetes-proxy';
import { patchConsoleUserSettingsViaConsoleProxy } from '@/utils/console-user-settings';
import { EnvVariables } from '@/utils/env-variables';
import { enableInstanceTypesDeveloperPreviewViaConsoleApi } from '@/utils/kubevirt-ui-features';
import { patchKubevirtUserSettingsHideWelcomeViaConsoleProxy } from '@/utils/kubevirt-user-settings';
import type { BrowserContext } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';

/** Privileged lanes: patch ConfigMaps through the kubeadmin console `/api/kubernetes` session. */
export async function runConsolePostLoginSetup(
  context: BrowserContext,
  consoleOrigin: string,
  options: { cnvNamespace?: string; userSettingsKey: string },
): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const storageState = await context.storageState();
  const csrfToken = csrfTokenFromPlaywrightCookies(storageState.cookies);
  if (!csrfToken) {
    throw new Error(
      'Console CSRF cookie missing after login — cannot patch cluster resources via /api/kubernetes',
    );
  }
  const apiContext = await playwrightRequest.newContext({
    baseURL: origin,
    ignoreHTTPSErrors: true,
    storageState,
  });
  try {
    if (!EnvVariables.isNonPrivUser) {
      await enableInstanceTypesDeveloperPreviewViaConsoleApi(apiContext, origin, {
        cnvNamespace: options.cnvNamespace,
        csrfToken,
      });
      await patchConsoleUserSettingsViaConsoleProxy(apiContext, origin, options.userSettingsKey, {
        csrfToken,
      });
      await patchKubevirtUserSettingsHideWelcomeViaConsoleProxy(apiContext, origin, { csrfToken });
    }
  } finally {
    await apiContext.dispose();
  }
}
