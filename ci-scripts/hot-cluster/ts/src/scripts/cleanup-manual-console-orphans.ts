/**
 * Remove per-instance manual-console artifacts that can outlive (or
 * predate) the trigger ConfigMap.
 *
 * Deploy creates the shared `manual-console` namespace plus a per-instance
 * ImageStream/BuildConfig *before* writing the ci-env ConfigMap. If the
 * job fails between those steps (e.g. OAuth probe Forbidden),
 * `/cleanup-manual-console` used to be a no-op because there was no CM to
 * patch -- leaving the build leftovers behind. Successful OAuth-mode
 * teardowns also leave those build objects in the shared namespace (the
 * controller deliberately does not delete it).
 *
 * This module deletes the instance-scoped ImageStream, BuildConfig, and
 * any lingering Helm release it can see. It never deletes the shared
 * namespace or the one-time RBAC bootstrap.
 *
 * Helm storage is secrets in the release namespace. The ARC runner SA is
 * not granted secrets access there (ci-env-controller owns Helm); a
 * Forbidden on `helm list`/`uninstall` is skipped with a warning so build
 * leftover cleanup still completes.
 */

import { execFileSync } from 'node:child_process';

export type ManualConsoleInstanceArtifacts = {
  buildConfig: string;
  helmRelease: string;
  imageStream: string;
};

export type RunIgnoreResult = {
  error?: string;
  ok: boolean;
};

export type OcRunner = {
  /**
   * Return trimmed stdout. Command failures propagate to the caller
   * (unlike best-effort deletes via runIgnore).
   */
  runSafe: (bin: string, args: string[]) => string;
  /**
   * Best-effort delete: never throws. Returns whether the command
   * succeeded so callers can record incomplete cleanup.
   */
  runIgnore: (bin: string, args: string[]) => RunIgnoreResult;
};

export type CleanupOrphansResult = {
  /** Resources that existed and were successfully removed. */
  cleaned: string[];
  /** Resources that existed but whose delete/uninstall failed. */
  failed: Array<{ error: string; resource: string }>;
};

/** Escape a literal for use inside a Helm --filter regex. */
export const escapeHelmFilter = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * True when Helm failed because the runner lacks secrets RBAC for release
 * storage. Generic Forbidden/Unauthorized (e.g. chart resource deletes)
 * must NOT match -- those stay unexpected failures.
 */
export const isHelmPermissionError = (message: string): boolean =>
  /\bsecrets?\b/i.test(message) && /forbidden|unauthorized/i.test(message);

export const resolveInstanceArtifacts = (
  instanceKey: string,
): ManualConsoleInstanceArtifacts => ({
  buildConfig: `kubevirt-plugin-${instanceKey}-build`,
  helmRelease: `manual-console-${instanceKey}`,
  imageStream: `kubevirt-plugin-${instanceKey}`,
});

export const formatExecError = (err: unknown): string => {
  const execErr = err as { message?: string; stderr?: string };
  const stderr = execErr.stderr?.trim();
  if (stderr) {
    return stderr;
  }
  return err instanceof Error ? err.message : String(err);
};

const defaultOcRunner = (): OcRunner => ({
  runIgnore: (bin, args) => {
    try {
      execFileSync(bin, args, { encoding: 'utf8', stdio: 'pipe' });
      return { ok: true };
    } catch (err) {
      return { error: formatExecError(err), ok: false };
    }
  },
  runSafe: (bin, args) =>
    execFileSync(bin, args, { encoding: 'utf8', stdio: 'pipe' }).trim(),
});

const tryDelete = (
  runner: OcRunner,
  resource: string,
  bin: string,
  args: string[],
  cleaned: string[],
  failed: CleanupOrphansResult['failed'],
): void => {
  const result = runner.runIgnore(bin, args);
  if (result.ok) {
    cleaned.push(resource);
  } else {
    failed.push({ error: result.error ?? 'delete failed', resource });
  }
};

/** Args for listing one release across all statuses without the 256-cap. */
export const helmListAllStatusesArgs = (
  namespace: string,
  helmRelease: string,
): string[] => [
  'list',
  '-n',
  namespace,
  '-q',
  '--filter',
  `^${escapeHelmFilter(helmRelease)}$`,
  '--max',
  '10000',
  '--deployed',
  '--failed',
  '--pending',
  '--superseded',
  '--uninstalling',
  '--uninstalled',
];

/**
 * Delete instance-scoped build + helm leftovers in the shared manual-console
 * namespace. Continues after individual delete failures; callers must treat
 * `failed` as incomplete cleanup. `cleaned` only lists resources actually
 * removed. Helm permission errors are skipped (not recorded as failed).
 */
export const cleanupManualConsoleOrphans = (
  namespace: string,
  instanceKey: string,
  runner: OcRunner = defaultOcRunner(),
): CleanupOrphansResult => {
  const artifacts = resolveInstanceArtifacts(instanceKey);
  const cleaned: string[] = [];
  const failed: CleanupOrphansResult['failed'] = [];

  // Missing namespace => nothing to clean (idempotent re-teardown).
  const nsRef = runner.runSafe('oc', [
    'get',
    'namespace',
    namespace,
    '--ignore-not-found',
    '-o',
    'name',
  ]);
  if (!nsRef) {
    return { cleaned, failed };
  }

  const imageStreamRef = runner.runSafe('oc', [
    'get',
    'imagestream',
    artifacts.imageStream,
    '-n',
    namespace,
    '--ignore-not-found',
    '-o',
    'name',
  ]);
  if (imageStreamRef) {
    tryDelete(
      runner,
      imageStreamRef,
      'oc',
      [
        'delete',
        'imagestream',
        artifacts.imageStream,
        '-n',
        namespace,
        '--wait=false',
        '--ignore-not-found',
      ],
      cleaned,
      failed,
    );
  }

  const buildConfigRef = runner.runSafe('oc', [
    'get',
    'buildconfig',
    artifacts.buildConfig,
    '-n',
    namespace,
    '--ignore-not-found',
    '-o',
    'name',
  ]);
  if (buildConfigRef) {
    // Deleting the BuildConfig also removes its Builds.
    tryDelete(
      runner,
      buildConfigRef,
      'oc',
      [
        'delete',
        'buildconfig',
        artifacts.buildConfig,
        '-n',
        namespace,
        '--wait=false',
        '--ignore-not-found',
      ],
      cleaned,
      failed,
    );
  }

  cleanupHelmRelease(runner, namespace, artifacts.helmRelease, cleaned, failed);

  return { cleaned, failed };
};

const cleanupHelmRelease = (
  runner: OcRunner,
  namespace: string,
  helmRelease: string,
  cleaned: string[],
  failed: CleanupOrphansResult['failed'],
): void => {
  let helmNames: string;
  try {
    helmNames = runner.runSafe('helm', helmListAllStatusesArgs(namespace, helmRelease));
  } catch (err) {
    const error = formatExecError(err);
    if (isHelmPermissionError(error)) {
      // Expected on ARC runners: no secrets RBAC in the release namespace.
      // Build leftovers above are the orphan path; Helm stays with the controller.
      console.log(
        `::warning::Skipping helm orphan check in ${namespace} (no secrets RBAC for runner): ${error}`,
      );
      return;
    }
    failed.push({
      error: `list failed: ${error}`,
      resource: `helmrelease/${helmRelease}`,
    });
    return;
  }

  const hasRelease = helmNames
    .split('\n')
    .map((line) => line.trim())
    .includes(helmRelease);
  if (!hasRelease) {
    return;
  }

  const resource = `helmrelease/${helmRelease}`;
  const result = runner.runIgnore('helm', [
    'uninstall',
    helmRelease,
    '-n',
    namespace,
    '--wait',
  ]);
  if (result.ok) {
    cleaned.push(resource);
    return;
  }

  const error = result.error ?? 'uninstall failed';
  if (isHelmPermissionError(error)) {
    // Same secrets-RBAC gap as list: runner cannot read Helm storage.
    console.log(
      `::warning::Skipping helm uninstall of ${helmRelease} in ${namespace} (no secrets RBAC for runner): ${error}`,
    );
    return;
  }

  // Chart/object delete failures (or other unexpected errors) stay visible.
  failed.push({ error, resource });
};
