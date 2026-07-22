/**
 * TTL-based cleanup of stale CI environments.
 * Only reaps E2E ConfigMaps (CI_ENV_LABEL), never manual-console.
 */

import * as k8s from '@kubernetes/client-node';

import type { CiEnvData, ControllerConfig } from './types';

const log = (msg: string): void => {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};

export const reapStale = async (
  kc: k8s.KubeConfig,
  config: ControllerConfig,
  teardownFn: (kc: k8s.KubeConfig, config: ControllerConfig, cm: k8s.V1ConfigMap) => Promise<void>,
): Promise<void> => {
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);
  const nowEpoch = Date.now() / 1000;

  const { items: cms } = await coreApi.listNamespacedConfigMap({
    namespace: config.ciEnvNs,
    labelSelector: config.ciEnvLabel,
  });

  for (const cm of cms) {
    const data = (cm.data ?? {}) as unknown as CiEnvData;
    const desired = data['desired-state'] ?? '';
    const status = data.status ?? '';

    if (desired !== 'present' || status === 'cleaning' || status === 'cleaned') continue;

    const createdTs = cm.metadata?.creationTimestamp;
    if (!createdTs) continue;

    const createdEpoch = new Date(createdTs).getTime() / 1000;
    const age = nowEpoch - createdEpoch;

    if (age > config.ttlSeconds) {
      log(
        `REAPER: ConfigMap ${cm.metadata?.name} is ${Math.round(age)}s old (TTL=${config.ttlSeconds}s), forcing cleanup`,
      );
      await teardownFn(kc, config, cm);
    }
  }
};
