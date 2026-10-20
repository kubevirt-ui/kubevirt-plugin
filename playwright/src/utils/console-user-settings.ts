import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import type { APIRequestContext } from '@playwright/test';

const USER_SETTINGS_NAMESPACE = 'openshift-console-user-settings';

export function consoleUserSettingsPreferencesJson(): string {
  return JSON.stringify({
    'console.homepage': 'admin',
    guidedTour: false,
    navigation: { autoHideNav: false },
    onboardingPopoversHidden: { catalog: true, createProject: true, vmsTab: true },
    quickStart: { activeQuickStartID: '', dontShowWelcomeModal: true },
  });
}

/**
 * Patch openshift-console-user-settings via the console `/api/kubernetes` proxy (post UI login).
 */
export async function patchConsoleUserSettingsViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  settingsKey: string,
  proxyOptions: ConsoleProxyRequestOptions = {},
): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const configMapName = `user-settings-${settingsKey}`;
  const instancePath = `/api/kubernetes/api/v1/namespaces/${USER_SETTINGS_NAMESPACE}/configmaps/${configMapName}`;
  const url = `${origin}${instancePath}`;
  const patchBody = {
    data: {
      [settingsKey]: consoleUserSettingsPreferencesJson(),
    },
  };

  const patch = await request.patch(url, {
    data: patchBody,
    headers: {
      ...headers,
      'Content-Type': 'application/merge-patch+json',
    },
  });
  if (patch.ok()) {
    return;
  }
  if (patch.status() === 404) {
    const create = await request.post(
      `${origin}/api/kubernetes/api/v1/namespaces/${USER_SETTINGS_NAMESPACE}/configmaps`,
      {
        data: {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: configMapName, namespace: USER_SETTINGS_NAMESPACE },
          data: patchBody.data,
        },
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      },
    );
    if (create.ok() || create.status() === 409) {
      const retry = await request.patch(url, {
        data: patchBody,
        headers: {
          ...headers,
          'Content-Type': 'application/merge-patch+json',
        },
      });
      if (retry.ok()) {
        return;
      }
    }
  }
  const body = await patch.text();
  throw new Error(
    `patch console user-settings ${configMapName} failed (${patch.status()}): ${body.slice(0, 500)}`,
  );
}
