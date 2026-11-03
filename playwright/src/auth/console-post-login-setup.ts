import { csrfTokenFromPlaywrightCookies } from '@/utils/console-kubernetes-proxy';
import { patchConsoleUserSettingsViaConsoleProxy } from '@/utils/console-user-settings';
import { EnvVariables } from '@/utils/env-variables';
import {
  enableInstanceTypesDeveloperPreviewViaConsoleApi,
  enableTreeViewFoldersViaConsoleApi,
} from '@/utils/kubevirt-ui-features';
import {
  enableDeclarativeHotplugVolumesViaConsoleApi,
  enableDeployPasstNetworkBindingViaConsoleApi,
} from '@/utils/kubevirt-hyperconverged-setup';
import { patchKubevirtUserSettingsHideWelcomeViaConsoleProxy } from '@/utils/kubevirt-user-settings';
import type { BrowserContext } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';

/**
 * Post-login setup (kubeadmin). Patches match Virtualization → Settings → Preview features:
 * - Enable folders in Virtual Machines tree view → `kubevirt-ui-features` / `treeViewFolders`
 * - Enable Passt binding for primary user-defined networks → HCO annotation `deployPasstNetworkBinding`
 * - Enable advanced CD-ROM features → HCO `spec.featureGates.declarativeHotplugVolumes`
 */
export async function runConsolePostLoginSetup(
  context: BrowserContext,
  consoleOrigin: string,
  options: { cnvNamespace?: string; userSettingsKey: string },
): Promise<void> {
  if (EnvVariables.isNonPrivUser) {
    // Patched as kubeadmin oc in `nonpriv-admin-configmap-setup` before browser login.
    return;
  }

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
    await enableInstanceTypesDeveloperPreviewViaConsoleApi(apiContext, origin, {
      cnvNamespace: options.cnvNamespace,
      csrfToken,
    });
    // Preview: folders in Virtual Machines tree view (treeViewFolders)
    await enableTreeViewFoldersViaConsoleApi(apiContext, origin, {
      cnvNamespace: options.cnvNamespace,
      csrfToken,
    });
    // Preview: Passt binding for primary user-defined networks
    await enableDeployPasstNetworkBindingViaConsoleApi(apiContext, origin, {
      cnvNamespace: options.cnvNamespace,
      csrfToken,
    });
    // Preview: advanced CD-ROM features (declarativeHotplugVolumes)
    await enableDeclarativeHotplugVolumesViaConsoleApi(apiContext, origin, {
      cnvNamespace: options.cnvNamespace,
      csrfToken,
    });
    await patchConsoleUserSettingsViaConsoleProxy(apiContext, origin, options.userSettingsKey, {
      csrfToken,
    });
    await patchKubevirtUserSettingsHideWelcomeViaConsoleProxy(apiContext, origin, {
      csrfToken,
      cnvNamespace: options.cnvNamespace,
    });
  } finally {
    await apiContext.dispose();
  }
}
