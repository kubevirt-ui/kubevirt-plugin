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
 * any lingering Helm release. It never deletes the shared namespace or
 * the one-time RBAC bootstrap.
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

export const resolveInstanceArtifacts = (
  instanceKey: string,
): ManualConsoleInstanceArtifacts => ({
  buildConfig: `kubevirt-plugin-${instanceKey}-build`,
  helmRelease: `manual-console-${instanceKey}`,
  imageStream: `kubevirt-plugin-${instanceKey}`,
});

const formatExecError = (err: unknown): string => {
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

/**
 * Delete instance-scoped build + helm leftovers in the shared manual-console
 * namespace. Continues after individual delete failures; callers must treat
 * `failed` as incomplete cleanup. `cleaned` only lists resources actually
 * removed.
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

  // Filter to this release across all statuses, with a high --max so we
  // are not clipped by Helm's default 256-result page (filter is applied
  // after the page is fetched). Status flags keep pending/failed/etc.
  // visible even on Helm 3, where the default list is deployed-only.
  const helmNames = runner.runSafe('helm', [
    'list',
    '-n',
    namespace,
    '-q',
    '--filter',
    `^${escapeHelmFilter(artifacts.helmRelease)}$`,
    '--max',
    '10000',
    '--deployed',
    '--failed',
    '--pending',
    '--superseded',
    '--uninstalling',
    '--uninstalled',
  ]);
  const hasRelease = helmNames
    .split('\n')
    .map((line) => line.trim())
    .includes(artifacts.helmRelease);
  if (hasRelease) {
    const resource = `helmrelease/${artifacts.helmRelease}`;
    tryDelete(
      runner,
      resource,
      'helm',
      ['uninstall', artifacts.helmRelease, '-n', namespace, '--wait'],
      cleaned,
      failed,
    );
  }

  return { cleaned, failed };
};
