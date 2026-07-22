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

import type { ControllerConfig } from './types';
import { defaultConfig } from './types';
import { reconcileOne } from './reconciler';
import { reapStale } from './reaper';

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

  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();

  // Token refresh timer
  const tokenRefreshTimer = setInterval(() => {
    try {
      const token = readFileSync(SA_TOKEN_PATH, 'utf8').trim();
      const users = kc.getUsers();
      if (users.length > 0) {
        (users[0] as { token?: string }).token = token;
      }
    } catch (err) {
      log(`Token refresh failed: ${err instanceof Error ? err.message : err}`);
    }
  }, TOKEN_REFRESH_MS);
  tokenRefreshTimer.unref();

  // Graceful shutdown
  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    log(`Received ${signal}, shutting down gracefully...`);
    clearInterval(tokenRefreshTimer);
    clearInterval(mainLoopTimer);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason) => {
    log(`Unhandled rejection: ${reason}`);
  });

  // Main reconciliation loop
  let lastReap = 0;

  const reconcile = async (): Promise<void> => {
    if (shuttingDown) return;

    const coreApi = kc.makeApiClient(k8s.CoreV1Api);

    try {
      // TTL reaper (every 5 minutes)
      const now = Date.now() / 1000;
      if (now - lastReap > config.reapIntervalSeconds) {
        await reapStale(kc, config, async (kc2, cfg, cm) => {
          await reconcileOne(kc2, cfg, cm);
        });
        lastReap = now;
      }

      // List both ephemeral E2E and persistent manual-console ConfigMaps
      const [e2eCms, manualCms] = await Promise.all([
        coreApi.listNamespacedConfigMap({
          namespace: config.ciEnvNs,
          labelSelector: config.ciEnvLabel,
        }),
        coreApi.listNamespacedConfigMap({
          namespace: config.ciEnvNs,
          labelSelector: config.manualLabel,
        }),
      ]);

      const allCms = [...(e2eCms.items ?? []), ...(manualCms.items ?? [])];

      for (const cm of allCms) {
        try {
          await reconcileOne(kc, config, cm);
        } catch (err) {
          log(
            `ERROR reconciling ${cm.metadata?.name}: ${err instanceof Error ? err.message : err}`,
          );
        }
      }
    } catch (err) {
      log(`ERROR in reconciliation loop: ${err instanceof Error ? err.message : err}`);
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

main().catch((err) => {
  console.error(`FATAL: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
