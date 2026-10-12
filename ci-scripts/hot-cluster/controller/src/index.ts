/**
 * ci-env-controller — watches labeled ConfigMaps and reconciles
 * CI test environments (namespace, Helm chart) on demand.
 *
 * Replaces: ci-scripts/hot-cluster/helm/ci-env-controller/scripts/ci-env-controller.sh
 *
 * Designed to run as a long-lived Deployment pod with in-cluster auth.
 */

import { readFileSync } from 'node:fs';

import * as k8s from '@kubernetes/client-node';

import { reapStale } from './reaper';
import { reconcileOne } from './reconciler';
import type { ControllerConfig } from './types';
import { defaultConfig } from './types';

const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const TOKEN_REFRESH_MS = 50 * 60 * 1000;

const log = (msg: string): void => {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};

const main = async (): Promise<void> => {
  const config: ControllerConfig = defaultConfig;

  log('ci-env-controller starting');
  log(`  CI_ENV_NS=${config.ciEnvNs}`);
  log(`  CI_ENV_TTL_SECONDS=${config.ttlSeconds}`);
  log(`  CI_ENV_LABEL=${config.ciEnvLabel}`);
  log(`  CI_ENV_MANUAL_LABEL=${config.manualLabel}`);
  log(`  HELM_CHART_PATH=${config.helmChartPath}`);

  const kubeConfig = new k8s.KubeConfig();
  kubeConfig.loadFromCluster();

  // Token refresh timer
  const tokenRefreshTimer = setInterval(() => {
    try {
      const token = readFileSync(SA_TOKEN_PATH, 'utf8').trim();
      const users = kubeConfig.getUsers();
      if (users.length > 0) {
        (users[0] as { token?: string }).token = token;
      }
    } catch (err) {
      log(`Token refresh failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, TOKEN_REFRESH_MS);
  tokenRefreshTimer.unref();

  // Graceful shutdown
  const shuttingDown = { value: false };
  const shutdown = (signal: string): void => {
    if (shuttingDown.value) {
      return;
    }
    shuttingDown.value = true;
    log(`Received ${signal}, shutting down gracefully...`);
    clearInterval(tokenRefreshTimer);
    clearInterval(mainLoopTimer);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason) => {
    log(`Unhandled rejection: ${String(reason)}`);
  });

  // Main reconciliation loop
  const lastReap = { value: 0 };

  const reconcile = async (): Promise<void> => {
    if (shuttingDown.value) {
      return;
    }

    const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

    try {
      // TTL reaper (every 5 minutes)
      const now = Date.now() / 1000;
      if (now - lastReap.value > config.reapIntervalSeconds) {
        await reapStale(kubeConfig, config, async (kc2, cfg, configMap) => {
          await reconcileOne(kc2, cfg, configMap);
        });
        lastReap.value = now;
      }

      // List both ephemeral E2E and persistent manual-console ConfigMaps
      const [e2eCms, manualCms] = await Promise.all([
        coreApi.listNamespacedConfigMap({
          labelSelector: config.ciEnvLabel,
          namespace: config.ciEnvNs,
        }),
        coreApi.listNamespacedConfigMap({
          labelSelector: config.manualLabel,
          namespace: config.ciEnvNs,
        }),
      ]);

      const allCms = [...(e2eCms.items ?? []), ...(manualCms.items ?? [])];

      for (const configMap of allCms) {
        try {
          await reconcileOne(kubeConfig, config, configMap);
        } catch (err) {
          log(
            `ERROR reconciling ${configMap.metadata?.name}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    } catch (err) {
      log(`ERROR in reconciliation loop: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Initial reconcile
  await reconcile();

  // Poll loop
  const mainLoopTimer = setInterval(() => {
    reconcile().catch((err) => {
      log(`ERROR: reconcile loop failed: ${err instanceof Error ? err.message : err}`);
    });
  }, config.pollIntervalMs);
};

void main().catch((err) => {
  console.error(`FATAL: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
