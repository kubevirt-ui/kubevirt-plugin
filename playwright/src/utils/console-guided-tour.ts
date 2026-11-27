import * as fs from 'fs';
import * as os from 'os';

import * as path from 'path';

import { runOcCommand } from '@/utils/cluster-oc';
import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import {
  consoleUserSettingsConfigMapName,
  consoleUserSettingsRbac,
  USER_SETTINGS_NAMESPACE,
} from '@/utils/console-user-settings';
import { logger } from '@/utils/logger';
import type { APIRequestContext } from '@playwright/test';

/** Console 4.22 per-user setting for guided-tour completion (`<perspective>.completed`). */
export const CONSOLE_GUIDED_TOUR_DATA_KEY = 'console.guidedTour';

const GUIDED_TOUR_PERSPECTIVES = ['admin', 'dev', 'virtualization-perspective'];

/** Merge existing `console.guidedTour` so every perspective tour is marked completed. */
export function buildConsoleGuidedTourJson(existing?: string): string {
  let tour: Record<string, Record<string, unknown>> = {};
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as unknown;
      if (parsed && typeof parsed === 'object') {
        tour = parsed as Record<string, Record<string, unknown>>;
      }
    } catch {
      // Corrupt value: replace it, otherwise the modal would block every test.
    }
  }
  for (const perspective of GUIDED_TOUR_PERSPECTIVES) {
    const current = tour[perspective];
    tour[perspective] = {
      ...(current && typeof current === 'object' ? current : {}),
      completed: true,
    };
  }
  return JSON.stringify(tour);
}

function isNotFoundError(err: unknown): boolean {
  return (err instanceof Error ? err.message : String(err)).includes('NotFound');
}

function ocObjectExists(kubeconfig: string, kind: string, name: string): boolean {
  try {
    runOcCommand(
      `oc get ${kind} ${name} -n ${USER_SETTINGS_NAMESPACE} -o name`,
      kubeconfig,
      30_000,
    );
    return true;
  } catch (err) {
    if (isNotFoundError(err)) {
      return false;
    }
    throw err;
  }
}

/** Mirror console's `<cm>-role` / `<cm>-rolebinding` so the user can read their own CM. */
function ensureConsoleUserSettingsRbacViaOc(kubeconfig: string, username: string): void {
  const { configMapName, roleBindingName, roleName, subjectName } =
    consoleUserSettingsRbac(username);
  if (
    ocObjectExists(kubeconfig, 'role', roleName) &&
    ocObjectExists(kubeconfig, 'rolebinding', roleBindingName)
  ) {
    return;
  }
  const manifest = path.join(os.tmpdir(), `pw-console-user-settings-rbac-${Date.now()}.json`);
  fs.writeFileSync(
    manifest,
    `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${roleName}
  namespace: ${USER_SETTINGS_NAMESPACE}
rules:
- apiGroups: [""]
  resourceNames: ["${configMapName}"]
  resources: ["configmaps"]
  verbs: ["get", "list", "patch", "update", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${roleBindingName}
  namespace: ${USER_SETTINGS_NAMESPACE}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ${roleName}
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: "${subjectName}"
`,
    'utf8',
  );
  try {
    runOcCommand(`oc apply -f "${manifest}"`, kubeconfig);
  } finally {
    fs.unlinkSync(manifest);
  }
}

function patchConsoleGuidedTourConfigMapViaOc(kubeconfig: string, username: string): void {
  const configMapName = consoleUserSettingsConfigMapName(username);
  const configMapRef = `configmap ${configMapName} -n ${USER_SETTINGS_NAMESPACE}`;
  let existing: string | undefined;
  try {
    const raw = runOcCommand(`oc get ${configMapRef} -o json`, kubeconfig);
    const current = JSON.parse(raw) as { data?: Record<string, string> };
    existing = current.data?.[CONSOLE_GUIDED_TOUR_DATA_KEY];
  } catch (err) {
    if (!isNotFoundError(err)) {
      throw err;
    }
  }
  const data = { [CONSOLE_GUIDED_TOUR_DATA_KEY]: buildConsoleGuidedTourJson(existing) };
  const patchFile = path.join(os.tmpdir(), `pw-console-guided-tour-${Date.now()}.json`);
  fs.writeFileSync(patchFile, JSON.stringify({ data }), 'utf8');
  try {
    runOcCommand(`oc patch ${configMapRef} --type merge --patch-file "${patchFile}"`, kubeconfig);
  } catch (err) {
    if (!isNotFoundError(err)) {
      throw err;
    }
    // Console creates the ConfigMap on first login; pre-create it so the modal never renders.
    const manifest = path.join(os.tmpdir(), `pw-console-guided-tour-cm-${Date.now()}.json`);
    fs.writeFileSync(
      manifest,
      JSON.stringify({
        apiVersion: 'v1',
        data,
        kind: 'ConfigMap',
        metadata: { name: configMapName, namespace: USER_SETTINGS_NAMESPACE },
      }),
      'utf8',
    );
    try {
      runOcCommand(`oc apply -f "${manifest}"`, kubeconfig);
    } finally {
      fs.unlinkSync(manifest);
    }
  } finally {
    fs.unlinkSync(patchFile);
  }
}

/**
 * Global setup (admin `oc`): mark the console guided tour completed for `usernames`
 * so `#guided-tour-modal` never blocks the UI.
 *
 * `openshift-console-user-settings` CMs are pre-created for users that never logged in
 * (HTPasswd `test-users` accounts exist before their OpenShift `User` object does), so the
 * welcome modal cannot render on their first session.
 */
export function ensureConsoleGuidedTourCompletedViaOc(
  kubeconfig: string,
  usernames: string[],
): void {
  for (const username of [...new Set(usernames)]) {
    ensureConsoleUserSettingsRbacViaOc(kubeconfig, username);
    patchConsoleGuidedTourConfigMapViaOc(kubeconfig, username);
    logger.info(`Console guided tour marked completed for "${username}"`);
  }
}

async function ensureProxyObject(
  request: APIRequestContext,
  collectionUrl: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
): Promise<void> {
  const name = (body.metadata as { name: string }).name;
  const current = await request.get(`${collectionUrl}/${name}`, { headers });
  if (current.ok()) {
    return;
  }
  if (current.status() !== 404) {
    throw new Error(
      `GET ${collectionUrl}/${name} failed (${current.status()}): ${(await current.text()).slice(
        0,
        300,
      )}`,
    );
  }
  const create = await request.post(collectionUrl, {
    data: body,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!create.ok() && create.status() !== 409) {
    throw new Error(
      `POST ${collectionUrl} failed (${create.status()}): ${(await create.text()).slice(0, 300)}`,
    );
  }
}

/** Mirror console's `<cm>-role` / `<cm>-rolebinding` (see openshift/console usersettings). */
async function ensureConsoleUserSettingsRbacViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  username: string,
  headers: Record<string, string>,
): Promise<void> {
  const { configMapName, roleBindingName, roleName, subjectName } =
    consoleUserSettingsRbac(username);
  const rbacBase = `${consoleOrigin}/api/kubernetes/apis/rbac.authorization.k8s.io/v1/namespaces/${USER_SETTINGS_NAMESPACE}`;
  await ensureProxyObject(
    request,
    `${rbacBase}/roles`,
    {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: { name: roleName, namespace: USER_SETTINGS_NAMESPACE },
      rules: [
        {
          apiGroups: [''],
          resourceNames: [configMapName],
          resources: ['configmaps'],
          verbs: ['get', 'list', 'patch', 'update', 'watch'],
        },
      ],
    },
    headers,
  );
  await ensureProxyObject(
    request,
    `${rbacBase}/rolebindings`,
    {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: { name: roleBindingName, namespace: USER_SETTINGS_NAMESPACE },
      roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'Role', name: roleName },
      subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: subjectName }],
    },
    headers,
  );
}

async function patchConsoleGuidedTourConfigMapViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  username: string,
  headers: Record<string, string>,
): Promise<void> {
  const configMapName = consoleUserSettingsConfigMapName(username);
  const url = `${consoleOrigin}/api/kubernetes/api/v1/namespaces/${USER_SETTINGS_NAMESPACE}/configmaps/${configMapName}`;
  const current = await request.get(url, { headers });
  let existing: string | undefined;
  if (current.ok()) {
    const currentConfigMap = (await current.json()) as { data?: Record<string, string> };
    existing = currentConfigMap.data?.[CONSOLE_GUIDED_TOUR_DATA_KEY];
  }
  const data = { [CONSOLE_GUIDED_TOUR_DATA_KEY]: buildConsoleGuidedTourJson(existing) };
  const patchHeaders = {
    ...headers,
    'Content-Type': 'application/merge-patch+json',
  };

  const patch = await request.patch(url, { data: { data }, headers: patchHeaders });
  if (patch.ok()) {
    return;
  }
  if (patch.status() === 404) {
    const create = await request.post(
      `${consoleOrigin}/api/kubernetes/api/v1/namespaces/${USER_SETTINGS_NAMESPACE}/configmaps`,
      {
        data: {
          apiVersion: 'v1',
          data,
          kind: 'ConfigMap',
          metadata: { name: configMapName, namespace: USER_SETTINGS_NAMESPACE },
        },
        headers: { ...headers, 'Content-Type': 'application/json' },
      },
    );
    if (create.ok() || create.status() === 409) {
      const retry = await request.patch(url, { data: { data }, headers: patchHeaders });
      if (retry.ok()) {
        return;
      }
    }
  }
  throw new Error(
    `patch console user-settings ${configMapName} failed (${patch.status()}): ${(
      await patch.text()
    ).slice(0, 500)}`,
  );
}

/**
 * Global setup (privileged lanes, no `oc`): same `console.guidedTour` merge-patch via
 * kubeadmin's console `/api/kubernetes` proxy.
 */
export async function ensureConsoleGuidedTourCompletedViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  usernames: string[],
  proxyOptions: ConsoleProxyRequestOptions = {},
): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  for (const username of [...new Set(usernames)]) {
    await ensureConsoleUserSettingsRbacViaConsoleProxy(request, origin, username, headers);
    await patchConsoleGuidedTourConfigMapViaConsoleProxy(request, origin, username, headers);
    logger.info(`Console guided tour marked completed for "${username}"`);
  }
}
