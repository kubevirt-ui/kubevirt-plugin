import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { kubeconfigMatchesClusterUrl } from '@/utils/cluster-kubernetes-api';
import {
  CONSOLE_LAST_NAMESPACE_ALL,
  consoleUserSettingsPreferencesJson,
} from '@/utils/console-user-settings';
import { EnvVariables } from '@/utils/env-variables';
import {
  buildKubevirtUserSettingsHideWelcomeJson,
  buildKubevirtUserSettingsWelcomeJsonPatch,
  KUBEADMIN_KUBEVIRT_WELCOME_HIDDEN_JSON,
  openshiftUserKubevirtSettingsDataKey,
} from '@/utils/kubevirt-user-settings';
import { MINUTE } from '@/utils/test-config';

export function getDefaultKubeconfigPath(): string {
  return path.join(process.cwd(), '.kubeconfigs', 'test-config');
}

function kubeconfigCandidates(): string[] {
  const candidates = [
    process.env.KUBECONFIG,
    getDefaultKubeconfigPath(),
    path.join(process.cwd(), '.kubeconfigs', 'playwright-e2e-config'),
  ].filter((p): p is string => Boolean(p));
  return [...new Set(candidates)];
}

/** Kubeconfig for kubeadmin cluster ops (non-priv lanes). Must match `CLUSTER_URL`. */
export function resolveKubeconfig(): string | undefined {
  if (EnvVariables.skipOcInvocations) {
    return undefined;
  }
  const clusterUrl = EnvVariables.clusterUrl;
  for (const candidate of kubeconfigCandidates()) {
    if (!fs.existsSync(candidate)) {
      continue;
    }
    if (clusterUrl && !kubeconfigMatchesClusterUrl(candidate, clusterUrl)) {
      continue;
    }
    return candidate;
  }
  return undefined;
}

/** Point process + `oc` at the kubeconfig written during global setup (kubeadmin). */
export function pinKubeconfigToProcess(kubeconfigPath: string): void {
  process.env.KUBECONFIG = kubeconfigPath;
}

/** False when `SKIP_OC_LOGIN` / local console mode — tests use console `/api/kubernetes` only. */
export function canRunOc(): boolean {
  return Boolean(resolveKubeconfig());
}

export function runOcCommand(cmd: string, kubeconfig?: string, timeoutMs = MINUTE): string {
  if (EnvVariables.skipOcInvocations) {
    throw new Error(`oc is disabled (IS_LOCAL=1 or SKIP_OC_LOGIN): ${cmd}`);
  }
  const kube = kubeconfig ?? resolveKubeconfig();
  const prefix = kube ? `KUBECONFIG="${kube}" ` : '';
  return execSync(`${prefix}${cmd}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: timeoutMs,
  });
}

function runOc(cmd: string, kubeconfig?: string, timeoutMs = MINUTE): string {
  return runOcCommand(cmd, kubeconfig, timeoutMs);
}

export function isKubeconfigAuthenticated(kubeconfig: string): boolean {
  try {
    const whoami = runOcCommand('oc whoami', kubeconfig, 30_000).trim();
    return whoami.length > 0 && !/unable to connect|Unauthorized|must be logged in/i.test(whoami);
  } catch {
    return false;
  }
}

/** Re-run kubeadmin `oc login` when the on-disk kubeconfig token is missing or expired. */
export function ensureKubeconfigAuthenticated(kubeConfigPath: string): void {
  if (isKubeconfigAuthenticated(kubeConfigPath)) {
    return;
  }
  ocLoginToCluster(kubeConfigPath);
  if (!isKubeconfigAuthenticated(kubeConfigPath)) {
    throw new Error(
      `Kubeconfig at ${kubeConfigPath} is not authenticated after oc login (check OPENSHIFT_PASSWORD / CLUSTER_URL)`,
    );
  }
}

/** Non-priv lanes: always kubeadmin for `oc`; console login uses `TEST_USERNAME` separately. */
export function ocLoginToCluster(kubeConfigPath: string): void {
  const clusterUrl = EnvVariables.clusterUrl;
  if (!clusterUrl) {
    throw new Error('CLUSTER_URL is required for oc login (or set SKIP_OC_LOGIN=1)');
  }
  const user = EnvVariables.username;
  const pass = EnvVariables.password;
  if (!pass) {
    throw new Error('OPENSHIFT_PASSWORD is required for oc login');
  }
  runOc(
    `oc login "${clusterUrl}" -u "${user}" -p "${pass}" --insecure-skip-tls-verify --kubeconfig="${kubeConfigPath}"`,
    undefined,
    2 * MINUTE,
  );
}

/** Non-priv / janitor only — privileged lanes patch user-settings via console proxy after login. */
export function patchConsoleUserSettings(kubeconfig: string, settingsKey: string): void {
  const namespace = 'openshift-console-user-settings';
  const configMapName = `user-settings-${settingsKey}`;
  const preferences = consoleUserSettingsPreferencesJson();
  const data = {
    [settingsKey]: preferences,
    'console.lastNamespace': CONSOLE_LAST_NAMESPACE_ALL,
    'console.guidedTour': JSON.stringify({
      admin: { completed: true },
      dev: { completed: true },
      'virtualization-perspective': { completed: true },
    }),
  };
  const patchFile = path.join(os.tmpdir(), `pw-console-user-settings-${Date.now()}.json`);
  fs.writeFileSync(patchFile, JSON.stringify({ data }), 'utf8');
  try {
    try {
      runOc(
        `oc patch configmap ${configMapName} -n ${namespace} --type merge --patch-file "${patchFile}"`,
        kubeconfig,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('NotFound')) {
        throw err;
      }
      // First login: console has not created the CM yet — create it as kubeadmin.
      const manifest = path.join(os.tmpdir(), `pw-console-user-settings-cm-${Date.now()}.json`);
      fs.writeFileSync(
        manifest,
        JSON.stringify({
          apiVersion: 'v1',
          data,
          kind: 'ConfigMap',
          metadata: { name: configMapName, namespace },
        }),
        'utf8',
      );
      try {
        runOc(`oc apply -f "${manifest}"`, kubeconfig);
      } finally {
        fs.unlinkSync(manifest);
      }
    }
  } finally {
    fs.unlinkSync(patchFile);
  }
}

/**
 * After non-priv browser login, patch welcome / guided-tour settings as kubeadmin.
 * The test-user API client cannot create openshift-console-user-settings CMs.
 */
export function ensureNonPrivWelcomeSettingsViaOc(
  kubeconfig: string,
  openshiftUsername: string,
  cnvNamespace?: string,
): void {
  let uid: string | undefined;
  try {
    uid = runOc(
      `oc get user ${openshiftUsername} -o jsonpath='{.metadata.uid}'`,
      kubeconfig,
    ).trim();
  } catch {
    uid = undefined;
  }

  const settingsKeys = new Set<string>([openshiftUsername]);
  if (uid) {
    settingsKeys.add(uid);
  }
  for (const key of settingsKeys) {
    patchConsoleUserSettings(kubeconfig, key);
  }

  patchKubevirtUserSettingsHideWelcomeForUser(kubeconfig, openshiftUsername, cnvNamespace);
}

const KUBEVIRT_USER_SETTINGS_CM = 'kubevirt-user-settings';

/** Non-priv: test user cannot GET `openshift-cnv/kubevirt-user-settings` via console proxy — patch as kubeadmin. */
export function patchKubevirtUserSettingsHideWelcomeForUser(
  kubeconfig: string,
  openshiftUsername: string,
  cnvNamespace?: string,
): void {
  const namespace = cnvNamespace ?? EnvVariables.cnvNamespace;
  let uid: string | undefined;
  try {
    uid = runOc(
      `oc get user ${openshiftUsername} -o jsonpath='{.metadata.uid}'`,
      kubeconfig,
    ).trim();
  } catch {
    uid = undefined;
  }
  const primaryKey = openshiftUserKubevirtSettingsDataKey(openshiftUsername, uid || undefined);
  const keys = new Set<string>([primaryKey, openshiftUsername]);
  if (uid) {
    keys.add(uid);
  }
  for (const key of keys) {
    patchKubevirtUserSettingsHideWelcomeForDataKey(kubeconfig, key, namespace);
  }
  if (!keys.has('kube-admin')) {
    patchKubevirtUserSettingsHideWelcomeForDataKey(kubeconfig, 'kube-admin', namespace);
  }
}

function patchKubevirtUserSettingsHideWelcomeForDataKey(
  kubeconfig: string,
  dataKey: string,
  namespace: string,
): void {
  let cm: { data?: Record<string, string> } | undefined;
  try {
    const raw = runOc(
      `oc get configmap ${KUBEVIRT_USER_SETTINGS_CM} -n ${namespace} -o json`,
      kubeconfig,
    );
    cm = JSON.parse(raw) as { data?: Record<string, string> };
  } catch {
    cm = undefined;
  }
  const patchOps = buildKubevirtUserSettingsWelcomeJsonPatch(cm, dataKey);
  const patchFile = path.join(os.tmpdir(), `pw-kubevirt-user-settings-${Date.now()}.json`);
  fs.writeFileSync(patchFile, JSON.stringify(patchOps), 'utf8');
  try {
    runOc(
      `oc patch configmap ${KUBEVIRT_USER_SETTINGS_CM} -n ${namespace} --type json --patch-file "${patchFile}"`,
      kubeconfig,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('NotFound')) {
      throw err;
    }
    const welcomeValue =
      dataKey === 'kube-admin'
        ? KUBEADMIN_KUBEVIRT_WELCOME_HIDDEN_JSON
        : buildKubevirtUserSettingsHideWelcomeJson();
    const manifest = path.join(os.tmpdir(), `pw-kubevirt-user-settings-cm-${Date.now()}.json`);
    fs.writeFileSync(
      manifest,
      JSON.stringify({
        apiVersion: 'v1',
        data: { [dataKey]: welcomeValue },
        kind: 'ConfigMap',
        metadata: { name: KUBEVIRT_USER_SETTINGS_CM, namespace },
      }),
      'utf8',
    );
    try {
      runOc(`oc apply -f "${manifest}"`, kubeconfig);
    } finally {
      fs.unlinkSync(manifest);
    }
  } finally {
    fs.unlinkSync(patchFile);
  }
}

export function deleteLabeledE2eNamespaces(kubeconfig?: string): void {
  runOc(
    `oc get ns -l kubevirt-plugin-e2e=true -o name | xargs -r oc delete --wait=false`,
    kubeconfig,
    2 * MINUTE,
  );
}

export function deletePwMigrationPolicies(kubeconfig?: string): void {
  try {
    const out = runOc(
      `oc get migrationpolicy -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
      kubeconfig,
    );
    const names = out
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.startsWith('pw-') || n === 'example');
    for (const name of names) {
      try {
        runOc(`oc delete migrationpolicy ${name} --ignore-not-found`, kubeconfig);
      } catch {
        // best-effort
      }
    }
  } catch {
    // CRD or permission missing
  }
}
