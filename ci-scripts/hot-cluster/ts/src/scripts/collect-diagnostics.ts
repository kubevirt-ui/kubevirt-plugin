/**
 * Collect E2E CI diagnostics — pod logs + cluster info.
 * Replaces the two "e2e CI diagnostics" bash run blocks in hot-cluster-e2e-run.yml.
 *
 * Env: TEST_NS, CI_ENV_NS, CI_ENV_CM
 * Optional: COLLECT_CLUSTER_INFO (set to "true" on failure)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { KubeClient } from '../kube-client';

const DIAG_BASE = '/tmp/e2e-ci-diagnostics';

const main = async (): Promise<void> => {
  const testNs = process.env.TEST_NS ?? '';
  const ciEnvNs = process.env.CI_ENV_NS ?? 'ci-env';
  const ciEnvCm = process.env.CI_ENV_CM ?? '';
  const collectClusterInfo = process.env.COLLECT_CLUSTER_INFO === 'true';

  const client = KubeClient.fromKubeconfig();
  const coreApi = client.coreV1;

  // --- Pod logs ---
  const logsDir = join(DIAG_BASE, 'pod-logs');
  mkdirSync(logsDir, { recursive: true });

  let helmRelease = ciEnvCm;
  if (ciEnvCm) {
    try {
      const { data } = await coreApi.readNamespacedConfigMap({ name: ciEnvCm, namespace: ciEnvNs });
      helmRelease = data?.['helm-release'] || ciEnvCm;
    } catch {
      /* use fallback */
    }
  }

  if (testNs && helmRelease) {
    for (const component of ['console', 'plugin']) {
      try {
        const { items } = await coreApi.listNamespacedPod({
          namespace: testNs,
          labelSelector: `app=${helmRelease}-${component}`,
        });
        const logs: string[] = [];
        for (const pod of items) {
          try {
            const podLog = await coreApi.readNamespacedPodLog({
              name: pod.metadata!.name!,
              namespace: testNs,
            });
            logs.push(`--- ${pod.metadata!.name} ---\n${podLog}`);
          } catch {
            /* pod may have no logs */
          }
        }
        const filename = component === 'console' ? 'console.log' : 'kubevirt-plugin.log';
        writeFileSync(join(logsDir, filename), logs.join('\n') || '(no logs found)');
        console.log(`Collected ${component} logs (${logs.length} pod(s))`);
      } catch (err) {
        console.warn(
          `Could not collect ${component} logs: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  // --- Cluster info (only on failure) ---
  if (collectClusterInfo) {
    const clusterDir = join(DIAG_BASE, 'cluster');
    mkdirSync(clusterDir, { recursive: true });

    // Nodes
    try {
      const { items } = await coreApi.listNode();
      const nodeLines = items.map((n) => {
        const ready = n.status?.conditions?.find((c) => c.type === 'Ready');
        return `${n.metadata?.name}\t${ready?.status ?? 'Unknown'}\t${n.status?.nodeInfo?.kubeletVersion ?? ''}`;
      });
      writeFileSync(join(clusterDir, 'nodes.txt'), nodeLines.join('\n'));
    } catch {
      /* best effort */
    }

    // HCO pods
    try {
      const { items } = await coreApi.listNamespacedPod({ namespace: 'openshift-cnv' });
      const podLines = items.map(
        (p) => `${p.metadata?.name}\t${p.status?.phase}\t${p.spec?.nodeName ?? ''}`,
      );
      writeFileSync(join(clusterDir, 'hco_pods.txt'), podLines.join('\n'));
    } catch {
      /* best effort */
    }

    // Test namespace events
    if (testNs) {
      try {
        const { items } = await coreApi.listNamespacedEvent({ namespace: testNs });
        const sorted = items.sort(
          (a, b) =>
            new Date(b.lastTimestamp ?? '').getTime() - new Date(a.lastTimestamp ?? '').getTime(),
        );
        const eventLines = sorted.map(
          (e) => `${e.lastTimestamp}\t${e.type}\t${e.reason}\t${e.message}`,
        );
        writeFileSync(join(clusterDir, 'test_ns_events.txt'), eventLines.join('\n'));
      } catch {
        /* best effort */
      }

      // Test namespace pods
      try {
        const { items } = await coreApi.listNamespacedPod({ namespace: testNs });
        const podLines = items.map(
          (p) => `${p.metadata?.name}\t${p.status?.phase}\t${p.spec?.nodeName ?? ''}`,
        );
        writeFileSync(join(clusterDir, 'test_ns_pods.txt'), podLines.join('\n'));
      } catch {
        /* best effort */
      }
    }

    console.log('Cluster diagnostics collected');
  }
};

main().catch((err) => {
  console.warn(`Diagnostics collection failed: ${err instanceof Error ? err.message : err}`);
});
