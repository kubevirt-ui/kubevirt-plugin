import { createHash } from 'crypto';

import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import type { APIRequestContext } from '@playwright/test';

export const USER_SETTINGS_NAMESPACE = 'openshift-console-user-settings';

/** Console project picker default after login (merge-patch `console.lastNamespace`). */
export const CONSOLE_LAST_NAMESPACE_ALL = 'all-namespaces';

const KUBEADMIN_USERNAMES = ['kubeadmin', 'kube:admin', 'kube-admin'];

export function isKubeadminUsername(username: string): boolean {
  return KUBEADMIN_USERNAMES.includes(username);
}

/**
 * Console 4.22 names user-settings ConfigMaps `user-settings-<sha256(username)>`;
 * `kube:admin` is special-cased to `user-settings-kubeadmin`
 * (`frontend/packages/console-shared/src/hooks/useUserSettings.ts`).
 */
export function consoleUserSettingsConfigMapName(username: string): string {
  if (isKubeadminUsername(username)) {
    return 'user-settings-kubeadmin';
  }
  return `user-settings-${createHash('sha256').update(username).digest('hex')}`;
}

/**
 * Console grants each user access to their own ConfigMap through a `<cm>-role` Role
 * restricted by `resourceNames` and a `<cm>-rolebinding` (see openshift/console
 * `pkg/usersettings/helpers.go`). CMs we pre-create must ship that RBAC too, otherwise the
 * console's first GET fails with 403 and the UI does not load.
 */
export function consoleUserSettingsRbac(username: string): {
  configMapName: string;
  roleBindingName: string;
  roleName: string;
  subjectName: string;
} {
  const configMapName = consoleUserSettingsConfigMapName(username);
  return {
    configMapName,
    roleBindingName: `${configMapName}-rolebinding`,
    roleName: `${configMapName}-role`,
    subjectName: isKubeadminUsername(username) ? 'kube:admin' : username,
  };
}

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
      'console.lastNamespace': CONSOLE_LAST_NAMESPACE_ALL,
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
          data: patchBody.data,
          kind: 'ConfigMap',
          metadata: { name: configMapName, namespace: USER_SETTINGS_NAMESPACE },
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
    `patch console user-settings ${configMapName} failed (${patch.status()}): ${body.slice(
      0,
      500,
    )}`,
  );
}
