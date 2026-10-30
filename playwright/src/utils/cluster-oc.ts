import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { kubeconfigMatchesClusterUrl } from '@/utils/cluster-kubernetes-api';
import { consoleUserSettingsPreferencesJson } from '@/utils/console-user-settings';
import { EnvVariables } from '@/utils/env-variables';
import {
  assertValidClusterApiUrl,
  assertValidK8sResourceName,
  assertValidOpenShiftUsername,
} from '@/utils/k8s-resource-names';
import {
  buildKubevirtUserSettingsHideWelcomeJson,
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

/** Run `oc` with argv (no shell — safe for validated resource names). */
export function runOcArgv(
  args: readonly string[],
  kubeconfig?: string,
  timeoutMs = MINUTE,
): string {
  if (EnvVariables.skipOcInvocations) {
    throw new Error(`oc is disabled (IS_LOCAL=1 or SKIP_OC_LOGIN): oc ${args.join(' ')}`);
  }
  const kube = kubeconfig ?? resolveKubeconfig();
  const env = { ...process.env };
  if (kube) {
    env.KUBECONFIG = kube;
  }
  const result = spawnSync('oc', [...args], {
    encoding: 'utf8',
    env,
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: timeoutMs,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new Error(detail || `oc ${args.join(' ')} exited with code ${result.status}`);
  }
  return result.stdout ?? '';
}

/** @deprecated Prefer `runOcArgv` — kept for static oc subcommands with no user input. */
export function runOcCommand(cmd: string, kubeconfig?: string, timeoutMs = MINUTE): string {
  const trimmed = cmd.trim();
  if (!trimmed.startsWith('oc ')) {
    throw new Error(`runOcCommand expects oc-prefixed command: ${cmd}`);
  }
  const parts = trimmed.slice(3).match(/(?:[^\s"']+|"[^"]*")+/g) ?? [];
  const args = parts.map((part) => (part.startsWith('"') ? part.slice(1, -1) : part));
  return runOcArgv(args, kubeconfig, timeoutMs);
}

function runOc(args: readonly string[], kubeconfig?: string, timeoutMs = MINUTE): string {
  return runOcArgv(args, kubeconfig, timeoutMs);
}

export function isKubeconfigAuthenticated(kubeconfig: string): boolean {
  try {
    const whoami = runOcArgv(['whoami'], kubeconfig, 30_000).trim();
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
  const clusterUrl = assertValidClusterApiUrl(EnvVariables.clusterUrl);
  const user = assertValidOpenShiftUsername(EnvVariables.username);
  const pass = EnvVariables.password;
  if (!pass) {
    throw new Error('OPENSHIFT_PASSWORD is required for oc login');
  }
  runOcArgv(
    [
      'login',
      clusterUrl,
      '-u',
      user,
      '-p',
      pass,
      '--insecure-skip-tls-verify',
      '--kubeconfig',
      kubeConfigPath,
    ],
    undefined,
    2 * MINUTE,
  );
}

/** Non-priv / janitor only — privileged lanes patch user-settings via console proxy after login. */
export function patchConsoleUserSettings(kubeconfig: string, settingsKey: string): void {
  const safeKey = assertValidK8sResourceName(settingsKey, 'user-settings key');
  const namespace = 'openshift-console-user-settings';
  const configMapName = `user-settings-${safeKey}`;
  const preferences = consoleUserSettingsPreferencesJson();
  const patchFile = path.join(os.tmpdir(), `pw-console-user-settings-${Date.now()}.json`);
  fs.writeFileSync(patchFile, JSON.stringify({ data: { [safeKey]: preferences } }), 'utf8');
  try {
    runOc(
      [
        'patch',
        'configmap',
        configMapName,
        '-n',
        namespace,
        '--type',
        'merge',
        '--patch-file',
        patchFile,
      ],
      kubeconfig,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('NotFound')) {
      return;
    }
    throw err;
  } finally {
    fs.unlinkSync(patchFile);
  }
}

const KUBEVIRT_USER_SETTINGS_CM = 'kubevirt-user-settings';

/** Non-priv: test user cannot GET `default/kubevirt-user-settings` via console proxy — patch as kubeadmin. */
export function patchKubevirtUserSettingsHideWelcomeForUser(
  kubeconfig: string,
  openshiftUsername: string,
): void {
  const username = assertValidOpenShiftUsername(openshiftUsername);
  let uid: string | undefined;
  try {
    uid = runOc(['get', 'user', username, '-o', 'jsonpath={.metadata.uid}'], kubeconfig).trim();
  } catch {
    uid = undefined;
  }
  const dataKey = openshiftUserKubevirtSettingsDataKey(username, uid || undefined);
  let existingRaw: string | undefined;
  try {
    const raw = runOc(
      ['get', 'configmap', KUBEVIRT_USER_SETTINGS_CM, '-n', 'default', '-o', 'json'],
      kubeconfig,
    );
    const cm = JSON.parse(raw) as { data?: Record<string, string> };
    existingRaw = cm.data?.[dataKey];
  } catch {
    existingRaw = undefined;
  }
  const value = buildKubevirtUserSettingsHideWelcomeJson(existingRaw);
  const patchFile = path.join(os.tmpdir(), `pw-kubevirt-user-settings-${Date.now()}.json`);
  fs.writeFileSync(patchFile, JSON.stringify({ data: { [dataKey]: value } }), 'utf8');
  try {
    runOc(
      [
        'patch',
        'configmap',
        KUBEVIRT_USER_SETTINGS_CM,
        '-n',
        'default',
        '--type',
        'merge',
        '--patch-file',
        patchFile,
      ],
      kubeconfig,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('NotFound')) {
      throw err;
    }
    const manifest = path.join(os.tmpdir(), `pw-kubevirt-user-settings-cm-${Date.now()}.json`);
    fs.writeFileSync(
      manifest,
      JSON.stringify({
        apiVersion: 'v1',
        data: { [dataKey]: value },
        kind: 'ConfigMap',
        metadata: { name: KUBEVIRT_USER_SETTINGS_CM, namespace: 'default' },
      }),
      'utf8',
    );
    try {
      runOc(['apply', '-f', manifest], kubeconfig);
    } finally {
      fs.unlinkSync(manifest);
    }
  } finally {
    fs.unlinkSync(patchFile);
  }
}

export function deleteLabeledE2eNamespaces(kubeconfig?: string): void {
  runOcArgv(
    ['delete', 'ns', '-l', 'kubevirt-plugin-e2e=true', '--wait=false'],
    kubeconfig,
    2 * MINUTE,
  );
}

export function deletePwMigrationPolicies(kubeconfig?: string): void {
  try {
    const out = runOcArgv(
      ['get', 'migrationpolicy', '-o', 'jsonpath={range .items[*]}{.metadata.name}{"\\n"}{end}'],
      kubeconfig,
    );
    const names = out
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.startsWith('pw-') || n === 'example');
    for (const rawName of names) {
      try {
        const name = assertValidK8sResourceName(rawName, 'MigrationPolicy name');
        runOcArgv(['delete', 'migrationpolicy', name, '--ignore-not-found'], kubeconfig);
      } catch {
        // best-effort
      }
    }
  } catch {
    // CRD or permission missing
  }
}
