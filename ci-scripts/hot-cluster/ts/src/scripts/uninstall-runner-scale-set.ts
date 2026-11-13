/**
 * Uninstall the ARC runner scale set Helm release and clean leftover CRs.
 *
 * Used by force_arc_reinstall before reinstall: helm upgrade alone can leave
 * the listener bound to a deleted EphemeralRunnerSet hash (crash loop /
 * zero GitHub runners). Uninstall-then-install clears that stale binding.
 *
 * Keeps the ARC controller release (arc / arc-systems) in place.
 *
 * Required env: RUNNER_SCALE_SET_NAME or CLUSTER_NAME
 * Optional env: ARC_RUNNERS_NS (default: arc-runners)
 */

import { execFileSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const DEFAULT_RUNNERS_NS = 'arc-runners';
const DEFAULT_CONTROLLER_NS = 'arc-systems';
const DEFAULT_CONTROLLER_RELEASE = 'arc';
const CLEANUP_TIMEOUT = '5m';
const CLEANUP_TIMEOUT_MS = 5 * 60 * 1000;

const SCALE_SET_NAME_LABEL = 'actions.github.com/scale-set-name';
const SCALE_SET_NAMESPACE_LABEL = 'actions.github.com/scale-set-namespace';

const ARC_CR_RESOURCES = 'ephemeralrunnerset,autoscalingrunnerset,autoscalinglistener';
const ARC_CRD_NAMES = [
  'ephemeralrunnersets.actions.github.com',
  'autoscalingrunnersets.actions.github.com',
  'autoscalinglisteners.actions.github.com',
] as const;

const execOutput = (err: unknown): string => {
  const execErr = err as { message?: string; stderr?: Buffer | string; stdout?: Buffer | string };
  const stdout = execErr.stdout?.toString() ?? '';
  const stderr = execErr.stderr?.toString() ?? '';
  return `${stdout}${stderr}${execErr.message ?? ''}`;
};

/** Helm status/uninstall stderr when the release is confirmed absent. */
const isHelmReleaseNotFound = (err: unknown): boolean =>
  /release:\s*(?:"[^"]*"\s+)?not found/i.test(execOutput(err));

const helmAvailable = (): boolean => {
  try {
    execFileSync('helm', ['version', '--short'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const installHelm = (): boolean => {
  try {
    execFileSync(
      'bash',
      ['-c', 'curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash'],
      { stdio: 'inherit' },
    );
  } catch {
    return false;
  }
  if (!helmAvailable()) {
    console.error('Helm install script finished but helm is not available on PATH');
    return false;
  }
  return true;
};

const ocAvailable = (): boolean => {
  try {
    execFileSync('oc', ['version', '--client'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const resolveScaleSetName = (): string => {
  const fromRunner = process.env.RUNNER_SCALE_SET_NAME?.trim();
  if (fromRunner) {
    return fromRunner;
  }
  return requireEnv('CLUSTER_NAME');
};

/**
 * True when helm status succeeds. False only for a confirmed release-not-found.
 * Other status failures propagate so callers do not treat unknown errors as absence.
 */
export const helmReleaseExists = (scaleSetName: string, runnersNamespace: string): boolean => {
  try {
    execFileSync('helm', ['status', scaleSetName, '--namespace', runnersNamespace], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return true;
  } catch (err) {
    if (isHelmReleaseNotFound(err)) {
      return false;
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
};

/** Helm uninstall: confirmed missing is OK; other failures throw. */
export const uninstallHelmScaleSet = (scaleSetName: string, runnersNamespace: string): void => {
  if (!helmReleaseExists(scaleSetName, runnersNamespace)) {
    console.log(`Runner scale set '${scaleSetName}' not found or already removed`);
    return;
  }

  console.log(
    `Uninstalling ARC runner scale set '${scaleSetName}' from namespace '${runnersNamespace}'...`,
  );
  execFileSync(
    'helm',
    [
      'uninstall',
      scaleSetName,
      '--namespace',
      runnersNamespace,
      '--wait',
      '--timeout',
      CLEANUP_TIMEOUT,
    ],
    { stdio: 'inherit' },
  );
};

/** True when at least one ARC scale-set CRD is installed on the cluster. */
const arcCrdsPresent = (): boolean => {
  for (const crd of ARC_CRD_NAMES) {
    try {
      execFileSync('oc', ['get', 'crd', crd], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: CLEANUP_TIMEOUT_MS,
      });
      return true;
    } catch {
      // try remaining CRDs
    }
  }
  return false;
};

/**
 * True when the ARC controller Helm release is present.
 * Unconfirmed status errors are treated as present so we do not skip cleanup.
 */
const arcControllerReleasePresent = (): boolean => {
  if (!helmAvailable()) {
    return false;
  }
  const controllerNs = process.env.ARC_CONTROLLER_NS?.trim() || DEFAULT_CONTROLLER_NS;
  const controllerRelease =
    process.env.ARC_CONTROLLER_INSTALL_NAME?.trim() || DEFAULT_CONTROLLER_RELEASE;
  try {
    return helmReleaseExists(controllerRelease, controllerNs);
  } catch (err) {
    console.warn(
      `Could not confirm ARC controller release absence (${execOutput(err).trim() || err}); assuming present for CR cleanup`,
    );
    return true;
  }
};

/**
 * Delete leftover ARC CRs cluster-wide.
 *
 * Chart 0.14.0 labels listeners/ERS/ARS with both scale-set-name and
 * scale-set-namespace. Prefer the tight selector; also delete by name-only
 * so older chart leftovers without the namespace label are still cleaned.
 *
 * When the controller release and ARC CRDs are both absent (fresh provision
 * before Install ARC), skip queries so force_arc_reinstall can continue.
 */
export const deleteLeftoverArcCrs = (scaleSetName: string, runnersNamespace: string): void => {
  const controllerPresent = arcControllerReleasePresent();
  const crdsPresent = arcCrdsPresent();
  if (!controllerPresent && !crdsPresent) {
    console.log(
      'ARC controller release and CRDs are absent; skipping leftover CR cleanup (controller not installed yet)',
    );
    return;
  }

  const nameSelector = `${SCALE_SET_NAME_LABEL}=${scaleSetName}`;
  const namespacedSelector = `${nameSelector},${SCALE_SET_NAMESPACE_LABEL}=${runnersNamespace}`;

  console.log(
    `Cleaning leftover EphemeralRunnerSet / AutoscalingRunnerSet / AutoscalingListener for '${scaleSetName}' (ns label ${runnersNamespace})...`,
  );

  // Tight selector (chart 0.14.0+): name + namespace labels; -A reaches listeners in arc-systems.
  execFileSync(
    'oc',
    [
      'delete',
      ARC_CR_RESOURCES,
      '-A',
      '-l',
      namespacedSelector,
      '--ignore-not-found',
      `--timeout=${CLEANUP_TIMEOUT}`,
    ],
    { stdio: 'inherit' },
  );

  // Fallback for older chart CRs that only have scale-set-name (no namespace label).
  execFileSync(
    'oc',
    [
      'delete',
      ARC_CR_RESOURCES,
      '-A',
      '-l',
      nameSelector,
      '--ignore-not-found',
      `--timeout=${CLEANUP_TIMEOUT}`,
    ],
    { stdio: 'inherit' },
  );
};

/** Count leftover CRs still matching this scale set (name label; any namespace). */
export const countLeftoverArcCrs = (scaleSetName: string): number => {
  // No ARC CRDs ⇒ no leftover CRs to count (same skip path as deleteLeftoverArcCrs).
  if (!arcCrdsPresent()) {
    return 0;
  }

  const output = execFileSync(
    'oc',
    [
      'get',
      ARC_CR_RESOURCES,
      '-A',
      '-l',
      `${SCALE_SET_NAME_LABEL}=${scaleSetName}`,
      '-o',
      'name',
      '--ignore-not-found',
      `--request-timeout=${CLEANUP_TIMEOUT}`,
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: CLEANUP_TIMEOUT_MS,
    },
  ).trim();
  if (!output) {
    return 0;
  }
  return output.split('\n').filter(Boolean).length;
};

export const uninstallRunnerScaleSet = (params: {
  runnersNamespace?: string;
  scaleSetName: string;
}): void => {
  const runnersNamespace = params.runnersNamespace ?? DEFAULT_RUNNERS_NS;
  const { scaleSetName } = params;

  let helmError: Error | undefined;

  if (!helmAvailable() && !installHelm()) {
    console.log(
      'WARNING: Helm not available; relying on oc CR cleanup to remove the scale set',
    );
  } else {
    try {
      uninstallHelmScaleSet(scaleSetName, runnersNamespace);
    } catch (err) {
      helmError = err instanceof Error ? err : new Error(String(err));
      console.error(`Helm uninstall failed: ${helmError.message}`);
    }
  }

  if (!ocAvailable()) {
    if (helmError) {
      throw new Error(
        `Helm uninstall failed and oc is unavailable for CR cleanup fallback: ${helmError.message}`,
      );
    }
    throw new Error(
      'oc not available: cannot verify or clean leftover ARC CRs after scale set uninstall',
    );
  }

  try {
    deleteLeftoverArcCrs(scaleSetName, runnersNamespace);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Leftover ARC CR cleanup failed (including timeouts): ${msg}` +
        (helmError ? ` (helm also failed: ${helmError.message})` : ''),
    );
  }

  const leftover = countLeftoverArcCrs(scaleSetName);
  if (leftover > 0) {
    throw new Error(
      `Scale set uninstall incomplete: ${leftover} ARC CR(s) still match ` +
        `${SCALE_SET_NAME_LABEL}=${scaleSetName}` +
        (helmError ? ` (helm also failed: ${helmError.message})` : ''),
    );
  }

  if (helmError) {
    // Zero leftover CRs must not paper over a failed Helm uninstall: confirm the
    // release is gone before allowing a subsequent helm upgrade --install.
    if (helmReleaseExists(scaleSetName, runnersNamespace)) {
      throw new Error(
        `Helm uninstall failed and release '${scaleSetName}' is still present after CR cleanup: ${helmError.message}`,
      );
    }
    console.log(
      `Helm uninstall failed earlier, but release '${scaleSetName}' is confirmed absent and oc CR cleanup found no leftovers`,
    );
  }
};

const main = (): void => {
  const scaleSetName = resolveScaleSetName();
  const runnersNamespace = process.env.ARC_RUNNERS_NS?.trim() || DEFAULT_RUNNERS_NS;
  uninstallRunnerScaleSet({ runnersNamespace, scaleSetName });
  console.log(`Scale set uninstall complete for '${scaleSetName}' (controller left installed).`);
};

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`::error::${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
