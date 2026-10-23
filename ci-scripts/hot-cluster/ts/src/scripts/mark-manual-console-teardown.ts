/**
 * Mark a manual console instance for teardown by patching its trigger
 * ConfigMap's desired-state to "absent".  ci-env-controller's existing
 * reconciliation loop handles Helm / OAuth cleanup from there.
 *
 * The ConfigMap patch runs first so the controller can begin teardown
 * immediately. Orphan cleanup (ImageStream / BuildConfig / stray Helm
 * release) follows and still runs when the ConfigMap is absent or its
 * lookup/patch fails -- e.g. deploy failed after setup-plugin-image.sh
 * before the trigger CM was written. See cleanup-manual-console-orphans.ts.
 *
 * Env: CM_NAME, CI_ENV_NS, INSTANCE_KEY, MANUAL_CONSOLE_NS,
 *      CLUSTER_NAME (for warning message)
 *
 * Outputs: found (true|false|unknown), orphans_cleaned, orphans_incomplete
 */

import { execFileSync } from 'node:child_process';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

import {
  cleanupManualConsoleOrphans,
  type CleanupOrphansResult,
} from './cleanup-manual-console-orphans';

const main = async (): Promise<void> => {
  const cmName = requireEnv('CM_NAME');
  const ciEnvNs = requireEnv('CI_ENV_NS');
  const instanceKey = requireEnv('INSTANCE_KEY');
  const manualConsoleNs = requireEnv('MANUAL_CONSOLE_NS');
  const clusterName = process.env.CLUSTER_NAME ?? '';

  // Patch first so ci-env-controller starts reconciling before we spend
  // time on instance-scoped build leftovers.
  let cmRef = '';
  let cmLookupFailed = false;
  let cmPatchFailed = false;
  try {
    cmRef = execFileSync(
      'oc',
      ['get', 'configmap', cmName, '-n', ciEnvNs, '--ignore-not-found', '-o', 'name'],
      { encoding: 'utf8' },
    ).trim();
  } catch (err) {
    cmLookupFailed = true;
    console.log(
      `::error::Failed to look up ConfigMap ${ciEnvNs}/${cmName}: ${
        err instanceof Error ? err.message : err
      }`,
    );
  }

  if (cmRef) {
    try {
      execFileSync(
        'oc',
        [
          'patch',
          'configmap',
          cmName,
          '-n',
          ciEnvNs,
          '--type',
          'merge',
          '-p',
          '{"data":{"desired-state":"absent"}}',
        ],
        { stdio: 'inherit' },
      );
      console.log(
        `Marked ${ciEnvNs}/${cmName} for teardown (desired-state=absent); ` +
          'ci-env-controller will remove its Helm release, namespace resources, and OAuth user shortly.',
      );
    } catch (err) {
      cmPatchFailed = true;
      console.log(
        `::error::Failed to patch ConfigMap ${ciEnvNs}/${cmName} desired-state=absent: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }
  }

  // true = patched; false = lookup confirmed absent; unknown = lookup or
  // patch could not establish a definitive outcome.
  if (cmLookupFailed || cmPatchFailed) {
    setOutput('found', 'unknown');
  } else if (cmRef) {
    setOutput('found', 'true');
  } else {
    setOutput('found', 'false');
  }

  // Always sweep instance-scoped build leftovers, including when the
  // ConfigMap is missing or its lookup/patch failed (pre-CM leftovers).
  let cleaned: string[] = [];
  let failed: CleanupOrphansResult['failed'] = [];
  let orphanLookupFailed = false;
  try {
    ({ cleaned, failed } = cleanupManualConsoleOrphans(manualConsoleNs, instanceKey));
  } catch (err) {
    orphanLookupFailed = true;
    const message = err instanceof Error ? err.message : String(err);
    console.log(
      `::error::Manual-console orphan lookup failed for ${instanceKey}: ${message}`,
    );
  }

  setOutput('orphans_cleaned', cleaned.length > 0 ? 'true' : 'false');
  setOutput(
    'orphans_incomplete',
    failed.length > 0 || orphanLookupFailed ? 'true' : 'false',
  );

  if (cleaned.length > 0) {
    console.log(
      `Removed leftover manual-console artifacts for ${instanceKey}: ${cleaned.join(', ')}`,
    );
  }
  if (failed.length > 0) {
    const details = failed.map((f) => `${f.resource} (${f.error})`).join('; ');
    console.log(
      `::error::Incomplete manual-console orphan cleanup for ${instanceKey}: ${details}`,
    );
  }

  if (!cmRef && !cmLookupFailed) {
    if (cleaned.length > 0) {
      console.log(
        `No trigger ConfigMap ${ciEnvNs}/${cmName} on ${clusterName}; ` +
          'cleaned pre-ConfigMap deploy leftovers only.',
      );
    } else if (failed.length === 0 && !orphanLookupFailed) {
      console.log(
        `::warning::No manual console ConfigMap ${ciEnvNs}/${cmName} found on ${clusterName} -- nothing to tear down.`,
      );
    }
  }

  // Fail after orphan outputs are written so the job does not look green
  // with leftovers or a failed ConfigMap lookup/patch.
  if (failed.length > 0 || orphanLookupFailed || cmLookupFailed || cmPatchFailed) {
    process.exit(1);
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
