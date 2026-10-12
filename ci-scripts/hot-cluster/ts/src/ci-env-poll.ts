/**
 * Shared poll helper for ci-env-controller trigger ConfigMaps.
 * Used by ci-env-request and manual-console-request to wait until
 * the controller provisions the environment (status=ready) or
 * reports an error (status=error).
 */

import { execSync } from 'node:child_process';

export type PollResult = {
  data: Record<string, string>;
  status: string;
};

const getConfigMapField = (name: string, namespace: string, field: string): string => {
  try {
    return execSync(`oc get configmap "${name}" -n "${namespace}" -o jsonpath='{.data.${field}}'`, {
      encoding: 'utf8',
    }).replace(/^'|'$/g, '');
  } catch {
    return '';
  }
};

const pollUntil = <T>(
  checkFn: () => Promise<T | undefined>,
  opts: { intervalMs: number; label: string; timeoutMs: number },
): Promise<T> =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async (): Promise<void> => {
      const result = await checkFn();
      if (result !== undefined) {
        return resolve(result);
      }
      if (Date.now() - start >= opts.timeoutMs) {
        return reject(new Error(`Timed out waiting for ${opts.label}`));
      }
      setTimeout(check, opts.intervalMs);
    };
    void check();
  });

/**
 * Poll a trigger ConfigMap until its status reaches a target value or times out.
 */
export const waitForConfigMapStatus = async (params: {
  intervalSeconds?: number;
  label?: string;
  name: string;
  namespace: string;
  targetStatus: string;
  timeoutSeconds: number;
}): Promise<PollResult> => {
  const { label = 'environment', name, namespace, targetStatus, timeoutSeconds } = params;
  const interval = params.intervalSeconds ?? 10;

  console.log(`Waiting for ci-env-controller to provision the ${label}...`);

  return pollUntil<PollResult>(
    async () => {
      const status = getConfigMapField(name, namespace, 'status');

      if (status === targetStatus) {
        console.log(`${label} is ${targetStatus}.`);
        const data: Record<string, string> = {};
        for (const field of ['bridge-base-address', 'console-route']) {
          data[field] = getConfigMapField(name, namespace, field);
        }
        return { data, status };
      }

      if (status === 'error') {
        const errMsg = getConfigMapField(name, namespace, 'error-message') || 'unknown error';
        throw new Error(`${label} provisioning failed: ${errMsg}`);
      }

      console.log(`  status=${status || 'pending'} (elapsed / ${timeoutSeconds}s)...`);
      return undefined;
    },
    { intervalMs: interval * 1000, label, timeoutMs: timeoutSeconds * 1000 },
  );
};

/**
 * Poll a trigger ConfigMap until cleanup completes (status=cleaned) or times out.
 */
export const waitForCleanup = async (params: {
  intervalSeconds?: number;
  name: string;
  namespace: string;
  timeoutSeconds: number;
}): Promise<void> => {
  const { name, namespace, timeoutSeconds } = params;
  const interval = params.intervalSeconds ?? 5;

  console.log('Waiting for controller to clean up...');

  await pollUntil<true>(
    async () => {
      const status = getConfigMapField(name, namespace, 'status');
      if (status === 'cleaned') {
        console.log('Cleanup complete.');
        return true;
      }
      return undefined;
    },
    { intervalMs: interval * 1000, label: 'controller cleanup', timeoutMs: timeoutSeconds * 1000 },
  ).catch(() => {
    const status = getConfigMapField(name, namespace, 'status');
    console.warn(`::warning::Timed out waiting for controller cleanup (status=${status})`);
  });
};
